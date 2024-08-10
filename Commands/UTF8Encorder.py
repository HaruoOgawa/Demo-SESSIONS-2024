import sys
import os

def main():
	#
	args = sys.argv
	inputPath = args[1]
	print("Encord Start: %s" %(inputPath))

	#
	FindFile(os.listdir(inputPath), inputPath)

# 
def FindFile(subfolders, parentPath):
	for folder in subfolders:
		if(folder == "Library"):
			continue

		currentPath = parentPath + "/" + folder

		if(os.path.isdir(currentPath)):
			FindFile(os.listdir(currentPath), currentPath)
		else:
			extension = currentPath[currentPath.rfind('.')+1:]

			if(extension == "cpp" or extension == "c" or extension == "h"):
				try:
					Data = None
					with open(currentPath, 'r') as f:
						Data = f.readlines()

					with open(currentPath, 'w', encoding="utf-8") as f:
						f.writelines(Data)
						print("[Encording] %s" %(currentPath))
				except:
					print("[Already Encoded] %s" %(currentPath))
				
#
main()
