# Java Version Note

## Why Java 21 Instead of Java 23/24?

We've configured the project to use **Java 21 LTS** instead of Java 23/24 due to compatibility issues with Lombok.

### The Problem
- Java 23/24 introduced changes to internal compiler APIs
- Lombok (annotation processor) hasn't fully adapted to these changes yet
- This causes `ExceptionInInitializerError: TypeTag :: UNKNOWN` errors

### The Solution
- **Java 21 LTS** is the current Long-Term Support version
- It has excellent compatibility with all libraries including Lombok
- It's stable and recommended for production use
- Supported until September 2026 (extended support until 2031)

### If You Must Use Java 23/24

If you absolutely need Java 23/24 features, you have these options:

1. **Wait for Lombok update**: Check Lombok releases for Java 23/24 support
2. **Remove Lombok**: Manually write getters/setters (not recommended)
3. **Use Java 23 without Lombok**: Remove Lombok dependency temporarily

### Current Configuration
- Java Version: 21 LTS
- Lombok: 1.18.32
- Spring Boot: 3.2.0

### To Switch Back to Java 23 (when Lombok supports it)

1. Update `pom.xml`:
   ```xml
   <properties>
       <java.version>23</java.version>
       <maven.compiler.source>23</maven.compiler.source>
       <maven.compiler.target>23</maven.compiler.target>
   </properties>
   ```

2. Update IntelliJ project SDK to Java 23
3. Rebuild project

