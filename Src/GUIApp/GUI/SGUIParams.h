#pragma once

#ifdef USE_GUIENGINE

#include <memory>
#include <vector>

namespace timeline { class CTimelineController; }
namespace resource { class CLoadWorker; }
namespace object { class C3DObject; }
namespace scene { class CSceneController; }
namespace app { class CFileModifier; }

namespace gui
{
	struct SGUIParams
	{
		std::vector<std::shared_ptr<object::C3DObject>> ObjectList;
		std::shared_ptr<scene::CSceneController> SceneController = nullptr;
		std::shared_ptr<app::CFileModifier> FileModifier = nullptr;
		std::shared_ptr<timeline::CTimelineController> TimelineController = nullptr;
		resource::CLoadWorker* pLoadWorker = nullptr;

		SGUIParams(const std::vector<std::shared_ptr<object::C3DObject>>& _ObjectList, const std::shared_ptr<scene::CSceneController>& _SceneController,
			const std::shared_ptr<app::CFileModifier>& _FileModifier, const std::shared_ptr<timeline::CTimelineController>& _TimelineController,
			resource::CLoadWorker* _pLoadWorker)
		{
			ObjectList = _ObjectList;
			SceneController = _SceneController;
			FileModifier = _FileModifier;
			TimelineController = _TimelineController;
			pLoadWorker = _pLoadWorker;
		}
	};
}
#endif