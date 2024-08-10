import os

Shared_Pre = """ 
cmake_minimum_required(VERSION 3.22.1)

# declare using C and C++
project(Garnet, C CXX)

set(CMAKE_BUILD_TYPE debug)

add_definitions(
	-DUSE_WEB_NATIVE
	-DUSE_WEBGPU
	-DNOMINMAX
	-DUSE_TEXTURE_LOADER
	-DUSE_GLTF
	-DUSE_VIEWER_CAMERA
	-DUSE_INPUT_SYSTEM
	-DUSE_GPGPU
	-DUSE_FBX
	-DUSE_ANIMATION
	-DUSE_SMALL_FBX
	-DUSE_MMD
	-DUSE_PHYSICS
	-DB3_USE_CLEW
)

add_executable(
	Garnet
"""

# EXPORTED_RUNTIME_METHODSを下記のような感じで,の後ろにスペースを入れるとうまくModuleに登録してくれないみたいなので注意
# EXPORTED_RUNTIME_METHODS=['ccall', 'UTF8ToString']
#									↑ これ
Shared_Post = """
)

message(STATUS "Library directory: ${CMAKE_CURRENT_SOURCE_DIR}/../src/Library/SmallFBX/lib/debug")

target_include_directories(Garnet PRIVATE ../src/Library/DawnLib/include ../src/Library/glm  ../src/Library/tinygltf  ../src/Library/SmallFBX/include)
link_directories(${CMAKE_CURRENT_SOURCE_DIR}/../src/Library/SmallFBX/lib/debug)
target_link_libraries(Garnet PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/../src/Library/SmallFBX/lib/debug/libSmallFBX.a ${CMAKE_CURRENT_SOURCE_DIR}/../src/Library/SmallFBX/lib/debug/zlib.a)

# target_link_libraries(Garnet PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/../src/Library/SmallFBX/lib/debug/SmallFBX.a ${CMAKE_CURRENT_SOURCE_DIR}/../src/Library/SmallFBX/lib/debug/zlib.a)
# target_link_libraries(Garnet PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/../src/Library/SmallFBX/lib/debug/sfbxLibList.a)

set_property(TARGET Garnet PROPERTY CXX_STANDARD 17)

if(EMSCRIPTEN)
	target_link_options(Garnet PRIVATE 
		-sEXPORTED_RUNTIME_METHODS=['ccall','UTF8ToString','malloc','free']
		-sUSE_WEBGPU=1
		-sALLOW_MEMORY_GROWTH
		-sFETCH
	)
	set(CMAKE_EXECUTABLE_SUFFIX ".js")
endif()
"""

ExcludedFolderList = ["Library", "Vulkan", "OpenGL", "DescMain", "CDescAppManager.cpp", "CDescAppManager.h", "DemoMain", "CDemoAppManager.cpp", "CDemoAppManager.h"]

#
def Remake():
	print("[START] Remake CMakeLists\n")

	#
	srcPath = "../src"
	exportText = ""

	#
	pathList = []
	FindDir(os.listdir(srcPath), pathList, srcPath)
	
	#
	exportText += Shared_Pre

	for path in pathList:
		print("[RESULT] %s" %(path))
		exportText += "	" + path + "\n"

	exportText += Shared_Post

	#
	#print(exportText)
	with open("../EmscriptenBuild/CMakeLists.txt", "w") as f:
		f.write(exportText)

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
			pathList.append(currentPath)

#
Remake()
