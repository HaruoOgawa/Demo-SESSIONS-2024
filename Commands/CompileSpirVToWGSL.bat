@rem CompileSpirVToWGSL.bat
@rem https://superuser.com/questions/1131904/how-to-extract-extension-of-input-file-parameter-using-windows-batch-script

set CurrentDir=%~dp0

set SrcFileName=%1
set Extension=%~x1
@rem https://stackoverflow.com/questions/12074510/remove-first-and-last-character-from-a-string-in-a-windows-batch-file
set Extension=%Extension:~1,10%

set CompileFileName=%~p1%~n1_%Extension%.spv
set DstFileName=%~p1%~n1_%Extension%.wgsl

naga %CompileFileName% %DstFileName%