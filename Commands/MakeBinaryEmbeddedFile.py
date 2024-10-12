import os

def Main():
    resouces = "E:\CppDev\Demo-SESSIONS-2024/"
    output = "Src/App/ScriptApp/"
    cppname = "CEmbeddedFileList"
    Prefix = ""

    # FileList = [
        # "Resources/Scene/Demo-SESSIONS-2024.json"
        # "Resources/Shaders/BloomMix.frag",
        # "Resources/Shaders/blossum.frag"
    # ]

    # FileList_Str = ' '.join(FileList)
    FileList_Str = '"Resources/Font/dist/msdf.png" "Resources/MaterialFrame/BloomMix_MF.json" "Resources/MaterialFrame/Blur1Pass_MF.json" "Resources/MaterialFrame/Brigtness_MF.json" "Resources/MaterialFrame/ChromaticAberration_MF.json" "Resources/MaterialFrame/FrameTexture_MF.json" "Resources/MaterialFrame/LastCenter_MF.json" "Resources/MaterialFrame/LightShaft_MF.json" "Resources/MaterialFrame/MRTBlit_MF.json" "Resources/MaterialFrame/PBR_MF.json" "Resources/MaterialFrame/ReduceBuffer_MF.json" "Resources/MaterialFrame/RotRing_MF.json" "Resources/MaterialFrame/SSR_MF.json" "Resources/MaterialFrame/SSWaterMix_MF.json" "Resources/MaterialFrame/Water_MF.json" "Resources/MaterialFrame/blossum_MF.json" "Resources/MaterialFrame/centercube_01_mf.json" "Resources/MaterialFrame/cubegrid_mf.json" "Resources/MaterialFrame/mrt_renderer_mf.json" "Resources/MaterialFrame/sdftext_mf.json" "Resources/Scene/Demo-SESSIONS-2024.json" "Resources/Scene/Demo-SESSIONS-2024.tl" "Resources/Shaders/BloomMix.frag" "Resources/Shaders/Blur1Pass.frag" "Resources/Shaders/Brigtness.frag" "Resources/Shaders/ChromaticAberration.frag" "Resources/Shaders/LastCenter.frag" "Resources/Shaders/LightShaft.frag" "Resources/Shaders/MRTBlit.frag" "Resources/Shaders/ReduceBuffer.frag" "Resources/Shaders/RotRing.frag" "Resources/Shaders/SSR.frag" "Resources/Shaders/SSWaterMix.frag" "Resources/Shaders/Water.frag" "Resources/Shaders/blossum.frag" "Resources/Shaders/centercube_01.frag" "Resources/Shaders/cubegrid.frag" "Resources/Shaders/loadingbar.frag" "Resources/Shaders/loadingbar.vert" "Resources/Shaders/minimum.vert" "Resources/Shaders/mrt_renderer.frag" "Resources/Shaders/objectspace_raymarching.vert" "Resources/Shaders/pbr.frag" "Resources/Shaders/pbr.vert" "Resources/Shaders/renderboard.vert" "Resources/Shaders/sdftext.frag" "Resources/Shaders/texture.frag"'
    
    print(FileList_Str)

    os.system("FileBinaryEmbedder -r %s -i %s -o %s -c %s" % (resouces, FileList_Str, output, cppname))

#
Main()