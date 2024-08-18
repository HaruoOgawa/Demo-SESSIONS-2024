#include <AppCore/CAppRunner.h>
#include "../App/ScriptApp/CScriptApp.h"

int main()
{
	app::SAppSettings Settings = {};
#ifndef _DEBUG
	Settings.Overlap = false;
#endif // !_DEBUG

	if (!app::CAppRunner::Run(std::make_shared<app::CScriptApp>(), Settings)) return 1;

	return 0;
}