import os

def Main():
    resouces = "E:\CppDev\Demo-SESSIONS-2024/"
    output = "Src/App/ScriptApp/"
    cppname = "CEmbeddedFileList"
    Prefix = ""

    FileList = [
        "Resources/Scene/Demo-SESSIONS-2024.json"
        # "Resources/Shaders/BloomMix.frag",
        # "Resources/Shaders/blossum.frag"
    ]

    FileList_Str = ' '.join(FileList)
    
    print(FileList_Str)

    os.system("FileBinaryEmbedder -r %s -i %s -o %s -c %s" % (resouces, FileList_Str, output, cppname))

#
Main()