# Solution for Java 24 with Lombok

## The Problem
- `ExceptionInInitializerError: TypeTag :: UNKNOWN`
- `--add-opens has no effect at compile time` warning
- IntelliJ's compiler doesn't use Maven's compiler arguments

## Solution: Configure IntelliJ to Use Maven for Building

### Step 1: Enable Maven Build Runner
1. Go to `File` → `Settings` → `Build, Execution, Deployment` → `Build Tools` → `Maven` → `Runner`
2. Check: ✅ `Delegate IDE build/run actions to Maven`
3. This makes IntelliJ use Maven's compiler with all the `--add-opens` flags
4. Click `Apply` and `OK`

### Step 2: Enable Annotation Processing (Still Required)
1. `File` → `Settings` → `Build, Execution, Deployment` → `Compiler` → `Annotation Processors`
2. Check: ✅ `Enable annotation processing`
3. Select: `Obtain processors from project classpath`
4. Click `Apply`

### Step 3: Install Lombok Plugin
1. `File` → `Settings` → `Plugins`
2. Search for "Lombok" and install it
3. Restart IntelliJ

### Step 4: Set Project SDK to Java 24
1. `File` → `Project Structure` (Ctrl+Alt+Shift+S)
2. Under `Project`:
   - Project SDK: Java 24
   - Project language level: `24 - Preview` (or highest available)
3. Click `Apply` and `OK`

### Step 5: Clean and Rebuild
1. `Build` → `Clean Project`
2. `Build` → `Rebuild Project`

## Alternative: Use Maven Command Line

If IntelliJ still has issues, compile from command line:

```bash
cd backend-spring
mvn clean compile
```

Then run:
```bash
mvn spring-boot:run -Dspring-boot.run.jvmArguments="--enable-native-access=ALL-UNNAMED"
```

## Why This Works

By delegating builds to Maven, IntelliJ will use the Maven compiler plugin which has all the `--add-opens` flags configured in `pom.xml`. This bypasses IntelliJ's internal compiler that was ignoring those flags.

