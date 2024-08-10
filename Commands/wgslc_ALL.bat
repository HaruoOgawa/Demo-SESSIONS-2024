set CurrentDir=%~dp0
set ShaderDir=..\Resources\Shaders
set EXEDir=E:\CppDev\Garnet\Garnet\src\Library\Vulkan\bin\

for /R %ShaderDir% %%i in (*.vert) do %EXEDir%glslc.exe -o %%~pi%%~ni_vert.spv %%~i

for /R %ShaderDir% %%i in (*.frag) do %EXEDir%glslc.exe -o %%~pi%%~ni_frag.spv %%~i

for /R %ShaderDir% %%i in (*.comp) do %EXEDir%glslc.exe -o %%~pi%%~ni_comp.spv %%~i

for /R %ShaderDir% %%i in (*.spv) do naga %%~i %%~pi%%~ni.wgsl 

pause