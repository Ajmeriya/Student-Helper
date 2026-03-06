# Solution: Switch to Java 21 LTS

## Why Java 21?

**Lombok does NOT support Java 24 yet.** The `TypeTag :: UNKNOWN` error is a fundamental incompatibility that cannot be fixed with compiler flags.

**Java 21 LTS is:**
- ✅ Fully supported by Lombok
- ✅ Long-Term Support (supported until 2031)
- ✅ Stable for production
- ✅ Works perfectly with Spring Boot 3.2.0
- ✅ No compatibility issues

## Steps to Switch:

### 1. Install Java 21 (if not installed)

Download from: https://adoptium.net/temurin/releases/?version=21

Or use winget:
```powershell
winget install EclipseAdoptium.Temurin.21.JDK
```

### 2. Set JAVA_HOME to Java 21

**In PowerShell (as Administrator):**
```powershell
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-21.0.x-hotspot", [System.EnvironmentVariableTarget]::Machine)
```

(Replace `x` with the actual version number)

**Or manually:**
- `Win + R` → `sysdm.cpl` → `Advanced` → `Environment Variables`
- Edit `JAVA_HOME` → Set to Java 21 path
- Click `OK`

### 3. Configure IntelliJ IDEA

1. **Set Project SDK:**
   - `File` → `Project Structure` (Ctrl+Alt+Shift+S)
   - Under `Project`:
     - **Project SDK**: Select `21` (add it if not listed)
     - **Project language level**: `21`
   - Click `Apply` and `OK`

2. **Set Maven JRE:**
   - `File` → `Settings` → `Build Tools` → `Maven` → `Runner`
   - **JRE**: Select `Use Project JDK` (should be Java 21)

### 4. Restart IntelliJ IDEA

Close and reopen IntelliJ completely.

### 5. Clean and Rebuild

1. `Build` → `Clean Project`
2. `Build` → `Rebuild Project`

## Result

✅ No more `ExceptionInInitializerError`
✅ No more `TypeTag :: UNKNOWN` errors
✅ Lombok works perfectly
✅ Build succeeds

## When Java 24 Support is Available

Once Lombok releases Java 24 support, you can switch back by:
1. Updating `pom.xml` to Java 24
2. Updating IntelliJ project SDK to Java 24
3. Rebuilding

But for now, **Java 21 LTS is the best choice**.

