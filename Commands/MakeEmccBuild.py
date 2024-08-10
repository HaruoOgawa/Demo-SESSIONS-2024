from ast import arg
from math import e
import os
import sys

#ExcludedFolderList = ["Library", "Vulkan", "OpenGL", "DescMain", "CDescAppManager.cpp", "CDescAppManager.h", "DemoMain", "CDemoAppManager.cpp", "CDemoAppManager.h", "Bullet3Serialize", "btBulletCollisionAll.cpp", "btBulletDynamicsAll.cpp", "btLinearMathAll.cpp"]
#IncludeDirectoryList = ["Src/Library/DawnLib/include", "Src/Library/glm", "Src/Library/tinygltf", "Src/Library/SmallFBX/include", "Src/Library/bullet3/Src"]
#PreprocessorList = ["NOMINMAX", "USE_WEB_NATIVE", "USE_WEBGPU", "USE_TEXTURE_LOADER", "USE_GLTF", "USE_VIEWER_CAMERA", "USE_INPUT_SYSTEM", "USE_GPGPU", "USE_FBX", "USE_ANIMATION", "USE_SMALL_FBX", "USE_MMD", "USE_PHYSICS", "B3_USE_CLEW", "BT_USE_DOUBLE_PRECISION", "BT_INTERNAL_UPDATE_SERIALIZATION_STRUCTURES"]
#EmccCompileDirList = ["Src", "Src/Library/SmallFBX/include", "Src/Library/bullet3/Src"]

ExcludedFolderList = ["Library", "Vulkan", "OpenGL", "WebMain", "CWebAppManager.cpp", "CWebAppManager.h", "DemoMain", "CDemoAppManager.cpp", "CDemoAppManager.h", "Bullet3Serialize", "btBulletCollisionAll.cpp", "btBulletDynamicsAll.cpp", "btLinearMathAll.cpp"]
IncludeDirectoryList = ["Src", "Src/Library/DawnLib/include", "Src/Library/GLFW/include", "Src/Library/glfw3webgpu", "Src/Library/glm", "Src/Library/tinygltf", "Src/Library/SmallFBX/include", "Src/Library/bullet3/Src", "Src/Library/imgui", "Src/Library/imgui/backends", "Src/Library/json"]
PreprocessorList = ["NOMINMAX", "USE_GLFW", "USE_WEBGPU", "USE_BINARY_READ", "USE_BINARY_WRITE", "USE_GUIENGINE", "USE_TEXTURE_LOADER", "USE_GLTF", "USE_VIEWER_CAMERA", "USE_INPUT_SYSTEM", "USE_GPGPU", "USE_FBX", "USE_ANIMATION", "USE_SMALL_FBX", "USE_MMD", "USE_PHYSICS", "B3_USE_CLEW", "BT_USE_DOUBLE_PRECISION", "BT_INTERNAL_UPDATE_SERIALIZATION_STRUCTURES"]
EmccCompileDirList = ["Src", "Src/Library/SmallFBX/include", "Src/Library/bullet3/Src", "Src/Library/imgui"]

ProjectEmccCompileDirList = ["../Src"]

# It's not something that changes that often, so every time there are more libs to link, I'll add my own.
LibObjDirList = ["/SmallFBX_lib"];

# 
def FindDir(subfolders, pathList, parentPath):
	for folder in subfolders:
		currentPath = parentPath + "/" + folder

		if(folder in ExcludedFolderList):
			print("[Exclude] %s" %(folder))
			continue

		if(os.path.isdir(currentPath)):
			FindDir(os.listdir(currentPath), pathList, currentPath)
		else:
			fileName, extension = os.path.splitext(currentPath)

			if(extension == ".cpp" or extension == ".c" or extension == ".o"):
				pathList.append(currentPath)
			else:
				continue

#
def Make():
	print("[START] Remake CMakeLists\n")

	args = sys.argv
	GarnetPath = args[1]
	
	if(GarnetPath == None or GarnetPath == ""):
		print("[Error] GarnetPath is empty.")
		return False
	
	print("GarnetPath: " + GarnetPath)

	#
	exportText = ""

	dstPath = "./obj/"

	# Find Cpp or C
	pathList = []
	for srcPath in ProjectEmccCompileDirList:
		FindDir(os.listdir(srcPath), pathList, srcPath)
		
	for srcPath in EmccCompileDirList:
		GarnetSrcPath = GarnetPath + srcPath
		FindDir(os.listdir(GarnetSrcPath), pathList, GarnetSrcPath)
	
	# Find obj
	RootLibObjDir = "../EmscriptenBuild/obj_lib"
	zlib_o_list = []
	FindDir(os.listdir(RootLibObjDir), zlib_o_list, RootLibObjDir)

	# emsdk_env.bat
	exportText += "call C:\\emsdk\\emsdk_env.bat\n"

	# mkdir obj
	exportText += "call mkdir obj > nul\n"
	exportText += "call del /s /q obj\\*  > nul\n"
	
	# 
	counter = 0

	# Compile to o
	for path in pathList:
		print("[RESULT] %s" %(path))
		
	    #
		exportText += "call echo [%d/%d] %s" % (counter + 1, len(pathList), path) + "\n"
		
		#
		exportText += "call emcc -o2 --no-heap-copy -c " + path + " -o " + dstPath + str(counter) + ".o "
		
		# Include Dir
		for inc in IncludeDirectoryList:
			exportText += "-I" + GarnetPath + inc + " "

		# Preprocessor
		for pre in PreprocessorList:
			exportText += "-D" + pre + " "

		exportText += "\n"
		
		counter += 1

	# All Link
	exportText += "call emcc -o2 --no-heap-copy "

	for i in range(0, counter):
		exportText += dstPath + str(i) + ".o" + " "
	
	for o in zlib_o_list:
		print("[RESULT] %s" %(o))
		exportText += o + " "

	# Compile Options
	exportText += "-sEXPORTED_RUNTIME_METHODS=ccall,UTF8ToString,UTF16ToString "
	exportText += "-sUSE_WEBGPU=1 "
	exportText += "-sALLOW_MEMORY_GROWTH "
	exportText += "-sFETCH "
	
	exportText += "-sUSE_GLFW=3 "

	exportText += "-o Garnet.js\n"

	# Result
	exportText += "call mkdir ..\\WebRelease\n > nul"
	exportText += "call del /s /q ..\\WebRelease\\*\n > nul"
	exportText += "call xcopy Garnet_front.js ..\\WebRelease\\ /y /s /i\n"
	exportText += "call xcopy Garnet*.* ..\\WebRelease\\ /y /s /i\n"
	exportText += "call xcopy ..\\Resources ..\\WebRelease\\Resources /y /s /i > nul\n"
	exportText += "call xcopy index.html ..\\WebRelease\\ /y /s /i > nul\n"
	
	exportText += "pause\n"

	#
	#print(exportText)
	with open("../EmscriptenBuild/build_emcc.bat", "w") as f:
		f.write(exportText)

#
Make()
