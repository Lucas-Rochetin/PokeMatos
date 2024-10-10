# Define targets and their associated scripts
BUILD_SCRIPT = bash build.sh
RUN_SCRIPT = node main.js

# Default target
all: build

# Build target - calls the build.sh script
build:
	@echo "Running build script..."
	@$(BUILD_SCRIPT)

# Run target - calls the run.sh script
run:
	@echo "Running application..."
	@$(RUN_SCRIPT)

# Rebuild target - cleans and then rebuilds
re: clean build

# Clean target - Add any necessary clean-up commands (if needed)
clean:
	@echo "Cleaning up..."
	@rm -rf ./node_modules # Example: Remove build directory if used
	@echo "Clean up completed."

# Phony targets to avoid naming conflicts with actual files
.PHONY: all build run re clean
