set CurrentDir=%~dp0
set ShaderDir=..\Resources\Shaders
set EXEDir=..\src\Library\Vulkan\bin\

for /R %ShaderDir% %%i in (*.vert) do %EXEDir%glslc.exe -o %%~pi%%~ni_vert.spv %%~i

for /R %ShaderDir% %%i in (*.frag) do %EXEDir%glslc.exe -o %%~pi%%~ni_frag.spv %%~i

pause