import cv2
import mediapipe as mp  # type: ignore
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS  # type: ignore
from deepface import DeepFace
from datetime import datetime
from collections import deque, Counter

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize Mediapipe Face Mesh
mp_face_mesh = mp.solutions.face_mesh.FaceMesh(refine_landmarks=True, max_num_faces=5)

# 3D model points for head pose estimation
face_3d_model = np.array([
    [0.0, 0.0, 0.0],  # Nose tip
    [0.0, -330.0, -65.0],  # Chin
    [-225.0, 170.0, -135.0],  # Left eye left corner
    [225.0, 170.0, -135.0],  # Right eye right corner
    [-150.0, -150.0, -125.0],  # Left mouth corner
    [150.0, -150.0, -125.0]  # Right mouth corner
], dtype=np.float64)

# Rolling history for stable emotion detection
emotion_history = deque(maxlen=10)  # Store the last 10 emotions

def detect_gaze_and_faces(frame):
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = mp_face_mesh.process(frame_rgb)

    if not results.multi_face_landmarks:
        return "No face detected", 0  # No faces detected

    landmarks = results.multi_face_landmarks[0]
    img_h, img_w, _ = frame.shape

    face_2d_points = np.array([
        (landmarks.landmark[1].x * img_w, landmarks.landmark[1].y * img_h),  # Nose tip
        (landmarks.landmark[199].x * img_w, landmarks.landmark[199].y * img_h),  # Chin
        (landmarks.landmark[33].x * img_w, landmarks.landmark[33].y * img_h),  # Left eye corner
        (landmarks.landmark[263].x * img_w, landmarks.landmark[263].y * img_h),  # Right eye corner
        (landmarks.landmark[61].x * img_w, landmarks.landmark[61].y * img_h),  # Left mouth corner
        (landmarks.landmark[291].x * img_w, landmarks.landmark[291].y * img_h)  # Right mouth corner
    ], dtype=np.float64)

    # Camera matrix configuration
    focal_length = 1 * img_w
    camera_matrix = np.array([
        [focal_length, 0, img_w / 2],
        [0, focal_length, img_h / 2],
        [0, 0, 1]
    ], dtype=np.float64)
    dist_coeffs = np.zeros((4, 1))

    success, rotation_vector, translation_vector = cv2.solvePnP(
        face_3d_model, face_2d_points, camera_matrix, dist_coeffs, flags=cv2.SOLVEPNP_ITERATIVE
    )

    rotation_matrix, _ = cv2.Rodrigues(rotation_vector)
    angles, _, _, _, _, _ = cv2.RQDecomp3x3(rotation_matrix)
    yaw = angles[1]  # Yaw (horizontal movement)

    YAW_TOLERANCE = 11  # Define tolerance for straight view
    if abs(yaw) <= YAW_TOLERANCE:
        return "Looking at screen", len(results.multi_face_landmarks)
    elif yaw < -YAW_TOLERANCE:
        return "Looking left", len(results.multi_face_landmarks)
    else:
        return "Looking right", len(results.multi_face_landmarks)

def detect_emotion_with_timestamp(frame, gaze_status):
    """Detect emotion only if the user is looking at the screen, with timestamp."""
    if gaze_status != "Looking at screen":
        return "Candidate not looking at the screen", None  # Skip emotion detection

    try:
        emotion_result = DeepFace.analyze(frame, actions=["emotion"], enforce_detection=False)
        emotion = emotion_result[0]["dominant_emotion"]
        timestamp = datetime.now().strftime('%H:%M:%S')  # Capture timestamp

        # Add to emotion history
        emotion_history.append(emotion)

        # Determine the most frequent emotion in the history for stability
        most_common_emotion = Counter(emotion_history).most_common(1)[0][0]
        return most_common_emotion, timestamp
    except Exception as e:
        print(f"DeepFace error: {e}")
        return "N/A", None

@app.route('/analyze', methods=['POST'])
def analyze():
    """Endpoint to analyze frame from webcam."""
    nparr = np.frombuffer(request.data, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Detect gaze and faces
    gaze_status, num_faces = detect_gaze_and_faces(frame)

    # Detect emotion with timestamp
    emotion, emotion_timestamp = detect_emotion_with_timestamp(frame, gaze_status)

    interview_status = "External Support Detected" if num_faces > 1 else "Candidate is Alone"

    print(f"Gaze: {gaze_status}, Faces: {num_faces}, Emotion: {emotion}, Time: {emotion_timestamp}")

    return jsonify({
        "gaze_status": gaze_status,
        "interview_status": interview_status,
        "num_faces": num_faces,
        "emotion": emotion,
        "emotion_timestamp": emotion_timestamp
    })

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
