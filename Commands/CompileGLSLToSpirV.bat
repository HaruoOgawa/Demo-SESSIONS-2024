@rem CompileGLSLToSpirV.bat
@rem https://superuser.com/questions/1131904/how-to-extract-extension-of-input-file-parameter-using-windows-batch-script

set CurrentDir=%~dp0
set EXEDir=..\src\Library\Vulkan\bin\

set SrcFileName=%1
set Extension=%~x1
@rem https://stackoverflow.com/questions/12074510/remove-first-and-last-character-from-a-string-in-a-windows-batch-file
set Extension=%Extension:~1,10%

set DstFileName=%~p1%~n1_%Extension%.spv

%CurrentDir%%EXEDir%glslc.exe -o %DstFileName% %SrcFileName%