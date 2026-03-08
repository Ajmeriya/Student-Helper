# CRITICAL: Fix Java 24 + IntelliJ Build Issue

## Problem
- JAVA_HOME still shows Java 23 (needs full restart)
- IntelliJ is using its own compiler (ignoring Maven's `--add-opens` flags)
- Build delegation to Maven is NOT enabled

## Solution (Do ALL Steps):

### Step 1: Set JAVA_HOME in Current Session (Temporary Fix)

**In your current terminal/IntelliJ terminal, run:**
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-24"
```

**Then verify:**
```powershell
echo $env:JAVA_HOME
mvn -version
```

Both should show Java 24.

### Step 2: Enable Maven Build Delegation in IntelliJ (MOST IMPORTANT!)

This is the KEY fix - IntelliJ must use Maven's compiler:

1. **Open IntelliJ IDEA**
2. Go to: `File` → `Settings` (or `Ctrl + Alt + S`)
3. Navigate to: `Build, Execution, Deployment` → `Build Tools` → `Maven` → `Runner`
4. **CHECK THIS BOX**: ✅ `Delegate IDE build/run actions to Maven`
5. Click `Apply` and `OK`

### Step 3: Set IntelliJ Maven JRE to Java 24

1. Still in `Settings`
2. Go to: `Build, Execution, Deployment` → `Build Tools` → `Maven` → `Runner`
3. Under `JRE`:
   - Select: `Use Project JDK` (should be Java 24)
   - OR manually select: `24` from the dropdown
4. Click `Apply` and `OK`

### Step 4: Verify Project SDK is Java 24

1. `File` → `Project Structure` (or `Ctrl + Alt + Shift + S`)
2. Under `Project`:
   - **Project SDK**: Should be `24` (add it if missing)
   - **Project language level**: `24 - Preview`
3. Click `Apply` and `OK`

### Step 5: Clean and Rebuild

1. `Build` → `Clean Project`
2. `Build` → `Rebuild Project`

## Why This Works

When you enable "Delegate IDE build/run actions to Maven":
- IntelliJ stops using its internal compiler
- It uses Maven's compiler plugin instead
- Maven's compiler respects the `--add-opens` flags in `pom.xml`
- The `--add-opens has no effect at compile time` warning will disappear

## Permanent JAVA_HOME Fix (After Restart)

After you restart your computer:
1. Press `Win + R`, type `sysdm.cpl`, press Enter
2. `Advanced` tab → `Environment Variables`
3. Under `System variables`, edit `JAVA_HOME`
4. Set to: `C:\Program Files\Java\jdk-24`
5. Click `OK` on all dialogs
6. Restart computer

