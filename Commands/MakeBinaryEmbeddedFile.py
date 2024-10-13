import os
import shutil
import json

def DoShaderMin(src, dst):
    cmd = "Commands\compress_tools\shader_minifier.exe --format text --preserve-externals uniform -o %s %s" % (dst, src)
    os.system(cmd)

def DoJSONMin(src, dst):
    with open(src, "rt") as f:
        content = f.read()
        f.close()
        org = json.loads(content)
        min_json = json.dumps(org, separators=(',', ':'))

        dstF = open(dst, 'w')
        dstF.write(min_json)
        dstF.close()

def Main():
    resouces = "E:\CppDev\Demo-SESSIONS-2024/"
    output = "Src/App/ScriptApp/"
    cppname = "CEmbeddedFileList"
    Prefix = "_Comp"
    
    FileList_Str = '"Resources/Font/dist/msdf.png" "Resources/MaterialFrame/BloomMix_MF.json" "Resources/MaterialFrame/Blur1Pass_MF.json" "Resources/MaterialFrame/Brigtness_MF.json" "Resources/MaterialFrame/ChromaticAberration_MF.json" "Resources/MaterialFrame/FrameTexture_MF.json" "Resources/MaterialFrame/LastCenter_MF.json" "Resources/MaterialFrame/LightShaft_MF.json" "Resources/MaterialFrame/MRTBlit_MF.json" "Resources/MaterialFrame/PBR_MF.json" "Resources/MaterialFrame/ReduceBuffer_MF.json" "Resources/MaterialFrame/RotRing_MF.json" "Resources/MaterialFrame/SSR_MF.json" "Resources/MaterialFrame/SSWaterMix_MF.json" "Resources/MaterialFrame/Water_MF.json" "Resources/MaterialFrame/blossum_MF.json" "Resources/MaterialFrame/centercube_01_mf.json" "Resources/MaterialFrame/cubegrid_mf.json" "Resources/MaterialFrame/mrt_renderer_mf.json" "Resources/MaterialFrame/sdftext_mf.json" "Resources/Scene/Demo-SESSIONS-2024.json" "Resources/Scene/Demo-SESSIONS-2024.tl" "Resources/Shaders/BloomMix.frag" "Resources/Shaders/Blur1Pass.frag" "Resources/Shaders/Brigtness.frag" "Resources/Shaders/ChromaticAberration.frag" "Resources/Shaders/LastCenter.frag" "Resources/Shaders/LightShaft.frag" "Resources/Shaders/MRTBlit.frag" "Resources/Shaders/ReduceBuffer.frag" "Resources/Shaders/RotRing.frag" "Resources/Shaders/SSR.frag" "Resources/Shaders/SSWaterMix.frag" "Resources/Shaders/Water.frag" "Resources/Shaders/blossum.frag" "Resources/Shaders/centercube_01.frag" "Resources/Shaders/cubegrid.frag" "Resources/Shaders/loadingbar.frag" "Resources/Shaders/loadingbar.vert" "Resources/Shaders/minimum.vert" "Resources/Shaders/mrt_renderer.frag" "Resources/Shaders/objectspace_raymarching.vert" "Resources/Shaders/pbr.frag" "Resources/Shaders/pbr.vert" "Resources/Shaders/renderboard.vert" "Resources/Shaders/sdftext.frag" "Resources/Shaders/texture.frag"'

    FilePathList = FileList_Str.split(" ")

    if(Prefix != ""):
        for srcPath in FilePathList:
            srcPath = srcPath.replace("\"","")

            paramList = srcPath.split(".")
            if len(paramList) != 2:
                continue

            extention = paramList[1]

            dstPath = paramList[0] + Prefix + "." + paramList[1]
            print("srcPath: %s / dstPath: %s _______________________________________________\n" % (srcPath, dstPath))

            if(extention == "vert" or extention == "frag"):
                # Shader圧縮
                DoShaderMin(srcPath, dstPath)
            elif(extention == "json"):
                # json圧縮
                DoJSONMin(srcPath, dstPath)
            else:
                # 単純に_Compを付けてコピー
                shutil.copyfile(srcPath, dstPath)
        
        # バイナリ埋め込みファイルを作成
        os.system("FileBinaryEmbedder -r %s -i %s -o %s -c %s -p %s" % (resouces, FileList_Str, output, cppname, Prefix))
    else:
        # バイナリ埋め込みファイルを作成
        os.system("FileBinaryEmbedder -r %s -i %s -o %s -c %s" % (resouces, FileList_Str, output, cppname))

#
Main()