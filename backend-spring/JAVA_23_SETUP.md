# Java 23/24 Setup Guide

## Issue: ExceptionInInitializerError with Lombok

If you're encountering `java.lang.ExceptionInInitializerError: com.sun.tools.javac.code.TypeTag :: UNKNOWN`, this is due to Lombok compatibility issues with Java 23/24.

## Solutions

### Option 1: Configure IntelliJ IDEA (Recommended)

1. **Enable Annotation Processing:**
   - Go to `File` → `Settings` (or `IntelliJ IDEA` → `Preferences` on Mac)
   - Navigate to `Build, Execution, Deployment` → `Compiler` → `Annotation Processors`
   - Check `Enable annotation processing`
   - Set `Annotation processor path` to use Maven dependencies

2. **Configure VM Options for Compilation:**
   - Go to `File` → `Settings` → `Build, Execution, Deployment` → `Compiler` → `Java Compiler`
   - In `Additional command line parameters`, add:
     ```
     --add-opens jdk.compiler/com.sun.tools.javac.code=ALL-UNNAMED --add-opens jdk.compiler/com.sun.tools.javac.comp=ALL-UNNAMED --add-opens jdk.compiler/com.sun.tools.javac.file=ALL-UNNAMED --add-opens jdk.compiler/com.sun.tools.javac.jvm=ALL-UNNAMED --add-opens jdk.compiler/com.sun.tools.javac.main=ALL-UNNAMED --add-opens jdk.compiler/com.sun.tools.javac.parser=ALL-UNNAMED --add-opens jdk.compiler/com.sun.tools.javac.processing=ALL-UNNAMED --add-opens jdk.compiler/com.sun.tools.javac.tree=ALL-UNNAMED --add-opens jdk.compiler/com.sun.tools.javac.util=ALL-UNNAMED
     ```

3. **Invalidate Caches:**
   - Go to `File` → `Invalidate Caches...`
   - Select `Invalidate and Restart`

### Option 2: Use Java 21 LTS (Most Stable)

Java 21 is the current Long-Term Support (LTS) version and has better compatibility:

1. Update `pom.xml`:
   ```xml
   <properties>
       <java.version>21</java.version>
       <maven.compiler.source>21</maven.compiler.source>
       <maven.compiler.target>21</maven.compiler.target>
   </properties>
   ```

2. Install Java 21 JDK and configure IntelliJ to use it.

### Option 3: Use Maven Command Line

If IntelliJ continues to have issues, compile from command line:

```bash
cd backend-spring
mvn clean compile
mvn spring-boot:run -Dspring-boot.run.jvmArguments="--enable-native-access=ALL-UNNAMED"
```

## Current Configuration

The `pom.xml` has been configured with:
- Lombok 1.18.30
- Maven compiler plugin with `--add-opens` flags for Java 23/24
- Annotation processor path configured

## Notes

- Java 23/24 are non-LTS versions and may have compatibility issues with some tools
- Java 21 LTS is recommended for production use
- The warnings about `sun.misc.Unsafe` are expected and can be suppressed with the JVM arguments

