import os

def Main():
	#
	# E:\CppDev\Garnet\Garnet\Src/Library/dawn/out_win
	srcPath = "../Src/Library/dawn"
	exportText = ""

	# FindLib
	libFileList = []
	libDirList = []

	FindDir(os.listdir(srcPath), libFileList, libDirList, srcPath)

	# ToTuple
	libFileList = tuple(libFileList)
	libDirList = tuple(libDirList)

	# MakeFile
	exportText = ""

	# dir
	exportText += "// Lib Dir ////////////////////////////////////////////////////////////////////////////////////////// \n"
	for ld in libDirList:
		exportText += ld + ";"

	exportText += "\n"

	# file
	exportText += "// Lib File ////////////////////////////////////////////////////////////////////////////////////////// \n"
	for lf in libFileList:
		exportText += lf + ";"

	with open("../Commands/LibList.txt", "w") as f:
		f.write(exportText)

# 
def FindDir(subfolders, libFileList, libDirList, parentPath):
	for folder in subfolders:
		currentPath = parentPath + "/" + folder

		if(currentPath == "E:\CppDev\Garnet\Garnet\Src/Library/dawn/out_win"):
			continue

		if(os.path.isdir(currentPath)):
			FindDir(os.listdir(currentPath), libFileList, libDirList, currentPath)
		elif(currentPath.find(".lib") != -1 and currentPath.find(".lib.recipe") == -1):
			#print("currentPath: %s" % (currentPath))
			libFileList.append(currentPath)
			libDirList.append(parentPath)

Main()