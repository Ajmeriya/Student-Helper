# How to Run the Application and See Simple Logs

## Option 1: Run from IntelliJ IDEA (Easiest)

### To see simple Spring Boot logs:

1. **Find the main class:**
   - Open `StudentHelperApplication.java`
   - Look for the `main` method

2. **Run the application:**
   - Click the green ▶️ arrow next to the `main` method
   - OR right-click on `StudentHelperApplication.java` → `Run 'StudentHelperApplication.main()'`
   - OR press `Shift + F10`

3. **View the logs:**
   - The "Run" tool window at the bottom will show Spring Boot startup logs
   - You'll see the Spring Boot banner and simple application logs

## Option 2: Run from Maven (Command Line)

### In IntelliJ Terminal or PowerShell:

```bash
cd backend-spring
mvn spring-boot:run
```

This will show clean Spring Boot logs.

## Option 3: Run the JAR file

After building:

```bash
cd backend-spring
mvn clean package
java -jar target/student-helper-backend-1.0.0.jar
```

## What You'll See (Simple Logs):

```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.2.0)

2026-02-13T00:01:04.395+05:30  INFO --- [           main] c.s.StudentHelperApplication : Starting StudentHelperApplication...
2026-02-13T00:01:04.398+05:30  INFO --- [           main] c.s.StudentHelperApplication : The following 1 profile is active: "dev"
...
2026-02-13T00:01:11.234+05:30  INFO --- [           main] c.s.StudentHelperApplication : Started StudentHelperApplication in 7.252 seconds
```

## Note About Java Version

**Important:** You need Java 21 installed for the build to work. 

If you want to use Java 23 (which you have), we can switch back, but Lombok may still have issues.

**To install Java 21:**
- Download from: https://adoptium.net/temurin/releases/?version=21
- Or use: `winget install EclipseAdoptium.Temurin.21.JDK`

