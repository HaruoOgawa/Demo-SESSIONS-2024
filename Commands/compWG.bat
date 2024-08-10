set CurrentDir=%~dp0
set ToolDir=%CurrentDir%compress_tools\

call %ToolDir%squishy-x64.exe -i "%CurrentDir%..\x64\ReleaseWG\Garnet.exe" -o "%CurrentDir%..\x64\ReleaseWG\Garnet_Comp.exe"

pause