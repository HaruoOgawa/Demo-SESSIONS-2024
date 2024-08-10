#pragma once

#include <set>
#include <map>
#include <string>
#include <memory>

namespace resource {
	class CLoadWorker;
	class CResourceManager; 
	class IResource;
}

namespace app
{
	class CFileModifier
	{
		std::set<std::string> m_EditingFileNameSet;

		bool m_UpdateReserved;

	private:
		void UpdateFile(resource::CLoadWorker* pLoadWorker);

	public:
		CFileModifier();

		virtual ~CFileModifier() = default;

		void AddEditingFileName(const std::string& FileName);

		bool Update(resource::CLoadWorker* pLoadWorker);

		void OnFileUpdated(resource::CLoadWorker* pLoadWorker);
	};
}