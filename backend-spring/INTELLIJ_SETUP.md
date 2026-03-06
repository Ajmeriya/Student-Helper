# IntelliJ IDEA Setup for Java 23 with Lombok

## Critical Steps to Fix ExceptionInInitializerError

Since IntelliJ IDEA uses its own compiler (not Maven's), you need to configure it separately:

### Step 1: Enable Annotation Processing

1. Go to `File` → `Settings` (or `IntelliJ IDEA` → `Preferences` on Mac)
2. Navigate to: `Build, Execution, Deployment` → `Compiler` → `Annotation Processors`
3. **Check**: ✅ `Enable annotation processing`
4. Select: `Obtain processors from project classpath`
5. Click `Apply`

### Step 2: Configure Java Compiler Options

1. Still in `Settings`, go to: `Build, Execution, Deployment` → `Compiler` → `Java Compiler`
2. Find: `Additional command line parameters`
3. **Add these parameters** (copy the entire line):
   ```
   --add-opens jdk.compiler/com.sun.tools.javac.code=ALL-UNNAMED --add-opens jdk.compiler/com.sun.tools.javac.comp=ALL-UNNAMED --add-opens jdk.compiler/com.sun.tools.javac.file=ALL-UNNAMED --add-opens jdk.compiler/com.sun.tools.javac.jvm=ALL-UNNAMED --add-opens jdk.compiler/com.sun.tools.javac.main=ALL-UNNAMED --add-opens jdk.compiler/com.sun.tools.javac.parser=ALL-UNNAMED --add-opens jdk.compiler/com.sun.tools.javac.processing=ALL-UNNAMED --add-opens jdk.compiler/com.sun.tools.javac.tree=ALL-UNNAMED --add-opens jdk.compiler/com.sun.tools.javac.util=ALL-UNNAMED
   ```
4. Click `Apply`

### Step 3: Install Lombok Plugin

1. Go to `File` → `Settings` → `Plugins`
2. Search for: `Lombok`
3. Install the **Lombok** plugin (by Michail Plushnikov)
4. Restart IntelliJ IDEA

### Step 4: Invalidate Caches and Rebuild

1. Go to `File` → `Invalidate Caches...`
2. Select: ✅ `Clear file system cache and Local History`
3. Select: ✅ `Clear downloaded shared indexes`
4. Click `Invalidate and Restart`
5. After restart, go to `Build` → `Rebuild Project`

### Step 5: Verify Java Version

1. Go to `File` → `Project Structure` (or `Ctrl+Alt+Shift+S`)
2. Under `Project`:
   - **Project SDK**: Should be Java 23
   - **Project language level**: Should be `23 - Preview`
3. Under `Modules` → `backend-spring`:
   - **Language level**: Should be `23 - Preview`

## Alternative: Use Java 21 LTS (Recommended)

If the above doesn't work, consider using Java 21 LTS which has better compatibility:

1. Update `pom.xml`:
   ```xml
   <properties>
       <java.version>21</java.version>
       <maven.compiler.source>21</maven.compiler.source>
       <maven.compiler.target>21</maven.compiler.target>
   </properties>
   ```

2. In IntelliJ: `File` → `Project Structure` → Set SDK to Java 21

## Troubleshooting

- If errors persist, try: `Build` → `Clean Project` then `Build` → `Rebuild Project`
- Make sure Lombok plugin is enabled: `File` → `Settings` → `Plugins` → `Lombok` ✅ Enabled
- Check that annotation processing is enabled (Step 1 above)

