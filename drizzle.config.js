/** @type { import("drizzle-kit").Config } */
const config = {
    dialect: "postgresql", 
    schema: "./utils/schema.js", // Keep .js here for JavaScript
    out: "./drizzle",
    dbCredentials: {
      url: 'postgresql://neondb_owner:IQx3TwNWzt6S@ep-wispy-sunset-a5eqflts.us-east-2.aws.neon.tech/ai-interview-mocker?sslmode=require'
    }
  };
  
  export default config;
  