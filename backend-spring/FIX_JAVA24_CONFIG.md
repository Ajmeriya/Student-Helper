# Fix Java 24 Configuration on Windows

## Issues Found:
1. ❌ **JAVA_HOME** is set to Java 23 (`C:\Program Files\Java\jdk-23`)
2. ❌ **Maven** is using Java 23 instead of Java 24
3. ✅ **Java 24** is installed and working (`java -version` shows 24.0.1)

## Fix Steps:

### Step 1: Update JAVA_HOME Environment Variable

1. **Open System Environment Variables:**
   - Press `Win + R`, type `sysdm.cpl`, press Enter
   - Go to `Advanced` tab → Click `Environment Variables`

2. **Update JAVA_HOME:**
   - Under `System variables`, find `JAVA_HOME`
   - Click `Edit`
   - Change value from: `C:\Program Files\Java\jdk-23`
   - To: `C:\Program Files\Java\jdk-24`
   - Click `OK`

3. **Update PATH (if needed):**
   - In `System variables`, find `Path`
   - Make sure `C:\Program Files\Java\jdk-24\bin` is at the top
   - If `C:\Program Files\Java\jdk-23\bin` is there, remove it or move it below Java 24

4. **Click OK** on all dialogs

5. **Restart your terminal/IntelliJ IDEA** for changes to take effect

### Step 2: Verify Maven Uses Java 24

After updating JAVA_HOME, run:
```powershell
mvn -version
```

It should show:
```
Java version: 24.0.1, vendor: Oracle Corporation, runtime: C:\Program Files\Java\jdk-24
```

If it still shows Java 23:
- Close and reopen your terminal
- Or restart IntelliJ IDEA

### Step 3: Configure IntelliJ IDEA

1. **Set Project SDK:**
   - `File` → `Project Structure` (Ctrl+Alt+Shift+S)
   - Under `Project`:
     - **Project SDK**: Select `24` (or add it if not listed)
     - **Project language level**: `24 - Preview`
   - Click `Apply` and `OK`

2. **Verify Maven Settings:**
   - `File` → `Settings` → `Build, Execution, Deployment` → `Build Tools` → `Maven` → `Runner`
   - **JRE**: Should be `Use Project JDK` or explicitly set to Java 24

### Step 4: Test Configuration

Run these commands in a NEW terminal (after restarting):
```powershell
java -version
javac -version
echo $env:JAVA_HOME
mvn -version
```

All should show Java 24.

## Quick PowerShell Script to Set JAVA_HOME

Run this in PowerShell **as Administrator**:

```powershell
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Java\jdk-24", [System.EnvironmentVariableTarget]::Machine)
```

Then restart your terminal/IDE.

