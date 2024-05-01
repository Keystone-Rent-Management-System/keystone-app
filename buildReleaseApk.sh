#!/bin/bash

#Get current branch
BRANCH_NAME=$(git branch --show-current)
#App name
APP_TYPE="pallax-app"

#Create app name
APP_NAME="$APP_TYPE-$BRANCH_NAME"

#build app
cd "./android"

options=("assemble-debug" "assemble-release" "bundle-release" "Quit")

select choice in "${options[@]}"; do
    case $choice in
        "assemble-debug")
            echo "Generating debug apk file"
            # Add code for Option 1
            ./gradlew app:assembleDebug

            #Rename built apk file
            FILE_PATH="app/build/outputs/apk/debug/"
            OLD_FILE="app-debug.apk"
            NEW_FILE="$APP_NAME"

            mv "$FILE_PATH$OLD_FILE" "$FILE_PATH$NEW_FILE.apk"
            open $FILE_PATH

            echo "$APP_NAME APK-Debug Build successful"

            break
            ;;
        "assemble-release")
            echo "Generating release apk file"
            # Add code for Option 2
            ./gradlew app:assembleRelease

            #Rename built apk file
            FILE_PATH="app/build/outputs/apk/release/"
            OLD_FILE="app-release.apk"
            NEW_FILE="$APP_NAME"

            mv "$FILE_PATH$OLD_FILE" "$FILE_PATH$NEW_FILE.apk"
            open $FILE_PATH

            echo "$APP_NAME APK-Release Build successful"
            break
            ;;
        "bundle-release")
            echo "Generating bundle aab file"
            # Add code for Option 3
            ./gradlew app:bundleRelease


            FILE_PATH="app/build/outputs/bundle/release/"
            OLD_FILE="app-release.aab"
            NEW_FILE="$APP_NAME"

            mv "$FILE_PATH$OLD_FILE" "$FILE_PATH$NEW_FILE.aab"
            open $FILE_PATH

            echo "$APP_NAME AAB Build successful"
            break
            ;;
        "Quit")
            echo "Exiting the script."
            break
            ;;
        *)
            echo "Invalid choice. Please choose a number from 1 to ${#options[@]}"
            ;;
    esac
done

