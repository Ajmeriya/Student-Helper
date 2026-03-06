# How to Run the Application

## ✅ Compilation Successful!

The project compiled successfully with Java 23 and Spring Boot 3.3.0.

## Ways to Run:

### Method 1: IntelliJ IDEA (Easiest)

1. **Open `StudentHelperApplication.java`**
2. **Click the green ▶️ arrow** next to the `main` method
   - OR right-click → `Run 'StudentHelperApplication.main()'`
   - OR press `Shift + F10`

3. **View the logs** in the "Run" tool window at the bottom

### Method 2: Maven Command

**In IntelliJ Terminal or PowerShell:**
```bash
cd backend-spring
mvn spring-boot:run
```

### Method 3: Run the JAR

**After building:**
```bash
cd backend-spring
mvn clean package
java -jar target/student-helper-backend-1.0.0.jar
```

## What You'll See:

Simple Spring Boot logs like:
```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
 :: Spring Boot ::                (v3.3.0)

Starting StudentHelperApplication using Java 23.0.2...
Started StudentHelperApplication in X seconds
```

## If You Get "ClassNotFoundException"

Make sure you:
1. **Compiled first**: `Build` → `Rebuild Project` in IntelliJ
2. **Or run**: `mvn clean compile` from terminal

The application should now run successfully! 🎉


