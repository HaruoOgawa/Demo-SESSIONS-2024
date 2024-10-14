#ifdef USE_GUIENGINE
#include "CGUIResourcesTab.h"
#include "../Model/CFileModifier.h"
#include "../../Message/Console.h"
#include <filesystem>

namespace gui
{
	CGUIResourcesTab::CGUIResourcesTab()
	{
		// ディレクトリリストを初期化
		InitDirectoryList("Resources");
	}

	CGUIResourcesTab::~CGUIResourcesTab()
	{
	}

	void CGUIResourcesTab::InitDirectoryList(std::string RootDir)
	{
		// Emscriptenはサポートしない
#ifdef __EMSCRIPTEN__
		return;
#endif // __EMSCRIPTEN__

		m_RootDir = FindDirectory(RootDir);
	}

	std::shared_ptr<SDirectoryInfo> CGUIResourcesTab::FindDirectory(const std::string& SearchDir)
	{
		std::shared_ptr<SDirectoryInfo> DstDir = std::make_shared<SDirectoryInfo>();

		DstDir->DirName = std::make_pair(DeleteParentDirName(SearchDir), SearchDir);

		if (std::filesystem::exists(SearchDir))
		{
			for (const auto& entry : std::filesystem::directory_iterator(SearchDir))
			{
				const auto& path = entry.path().generic_string();
				std::string name = DeleteParentDirName(path);

				if (std::filesystem::is_directory(path))
				{
					DstDir->SubDirList.push_back(FindDirectory(path));
				}
				else
				{
					DstDir->FileList.push_back(std::make_pair(name, path));
				}
			}
		}

		return DstDir;
	}

	bool CGUIResourcesTab::Draw(const std::shared_ptr<app::CFileModifier>& FileModifier)
	{
		// Emscriptenはサポートしない
#ifdef __EMSCRIPTEN__
		return true;
#endif // __EMSCRIPTEN__

		if (ImGui::BeginTabItem("Resources"))
		{
			if (!DrawDirGUI(m_RootDir, FileModifier)) return false;

			ImGui::EndTabItem();
		}

		return true;
	}

	bool CGUIResourcesTab::DrawDirGUI(const std::shared_ptr<SDirectoryInfo>& Dir, const std::shared_ptr<app::CFileModifier>& FileModifier)
	{
		// Emscriptenはサポートしない
#ifdef __EMSCRIPTEN__
		return true;
#endif // __EMSCRIPTEN__

		const bool IsOpened = ImGui::TreeNodeEx(Dir->DirName.first.c_str(), /*ImGuiTreeNodeFlags_OpenOnDoubleClick |*/ ImGuiTreeNodeFlags_Framed);

		if (IsOpened)
		{
			// Draw SubDir
			for (const auto& SubDir : Dir->SubDirList)
			{
				if (!DrawDirGUI(SubDir, FileModifier)) return false;
			}

			// Draw File
			for (const auto& File : Dir->FileList)
			{
				std::string Label = File.first + "##" + File.second;

				if (ImGui::Button(Label.c_str()))
				{
					std::string cmd = "start " + File.second;
					std::system(cmd.c_str());

					FileModifier->AddEditingFileName(File.second);
				}
			}

			ImGui::TreePop();
		}

		return true;
	}

	std::string CGUIResourcesTab::DeleteParentDirName(const std::string& Src)
	{
		int IndexYen = static_cast<int>(Src.rfind('\\'));
		int IndexSlash = static_cast<int>(Src.rfind('/'));

		if (IndexYen > IndexSlash)
		{
			int Index = IndexYen + 1;
			return Src.substr(Index, Src.size() - Index);
		}
		else if (IndexSlash > IndexYen)
		{
			int Index = IndexSlash + 1;
			return Src.substr(Index, Src.size() - Index);
		}
		else
		{
			return Src;
		}
	}
}
#endif