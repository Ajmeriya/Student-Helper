# Fix: Unsupported class file major version 67

## The Problem
- ✅ Compilation succeeded with Java 23
- ❌ Spring Boot plugin is running with an older Java version
- Class file version 67 = Java 23

## Solution: Ensure Maven Uses Java 23

### Step 1: Set JAVA_HOME to Java 23

**In IntelliJ Terminal or PowerShell, run:**
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-23"
```

**Verify:**
```powershell
echo $env:JAVA_HOME
mvn -version
```

Both should show Java 23.

### Step 2: Configure IntelliJ Maven to Use Java 23

1. `File` → `Settings` → `Build, Execution, Deployment` → `Build Tools` → `Maven` → `Runner`
2. Under **JRE**:
   - Select: **"Use Project JDK"** (should be Java 23)
   - OR manually select: **"23"** from dropdown
3. Click **"Apply"** and **"OK"**

### Step 3: Clean and Rebuild

1. `Build` → `Clean Project`
2. `Build` → `Rebuild Project`

## Alternative: Run from Command Line

If IntelliJ still has issues, run from terminal:

```bash
cd backend-spring
$env:JAVA_HOME = "C:\Program Files\Java\jdk-23"
mvn clean package
```

Then run:
```bash
java -jar target/student-helper-backend-1.0.0.jar
```

## Why This Happens

The Spring Boot Maven plugin runs in a separate JVM process. If that JVM is using an older Java version, it can't read Java 23 class files (version 67).

