import cv2
import mediapipe as mp

# Initialize Mediapipe Face Mesh
mp_face_mesh = mp.solutions.face_mesh.FaceMesh(
    static_image_mode=True, max_num_faces=1, refine_landmarks=True
)
mp_drawing = mp.solutions.drawing_utils

# Load an image from your webcam or any test image
image = cv2.imread('test_image.jpg')  # Replace with a valid image path

# Convert the image to RGB (Mediapipe expects RGB input)
image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

# Process the image with Mediapipe
results = mp_face_mesh.process(image_rgb)

# Check if any face landmarks were detected
if results.multi_face_landmarks:
    for landmarks in results.multi_face_landmarks:
        # Draw the face landmarks on the image
        mp_drawing.draw_landmarks(
            image, landmarks, mp.solutions.face_mesh.FACEMESH_TESSELATION
        )
    print("Face detected.")
else:
    print("No face detected.")

# Display the result
cv2.imshow('Test Image', image)
cv2.waitKey(0)
cv2.destroyAllWindows()
