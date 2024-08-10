#pragma once

#ifdef USE_GUIENGINE
#include <string>
#include <vector>
#include <memory>
#include <set>
#include <imgui.h>

namespace app { class CFileModifier; }

namespace gui
{
	struct SDirectoryInfo
	{
		std::pair<std::string, std::string> DirName;

		std::vector<std::shared_ptr<SDirectoryInfo>> SubDirList;

		std::vector<std::pair<std::string, std::string>> FileList;
	};

	class CGUIResourcesTab
	{
		std::shared_ptr<SDirectoryInfo> m_RootDir;

		std::set<std::string> m_EditingFileNameList;
	private:
		void InitDirectoryList(std::string RootDir);
		std::shared_ptr<SDirectoryInfo> FindDirectory(const std::string& SearchDir);

		bool DrawDirGUI(const std::shared_ptr<SDirectoryInfo>& Dir, const std::shared_ptr<app::CFileModifier>& FileModifier);

		std::string DeleteParentDirName(const std::string& Src);
		
	public:
		CGUIResourcesTab();
		virtual ~CGUIResourcesTab();

		bool Draw(const std::shared_ptr<app::CFileModifier>& FileModifier);
	};
}
#endif