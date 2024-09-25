#pragma once

#ifdef USE_GUIENGINE

#include <memory>
#include <vector>
#include <map>
#include <string>

namespace timeline { class CTimelineController; }
namespace resource { class CLoadWorker; }
namespace object { class C3DObject; }
namespace scene { class CSceneController; }
namespace app { class CFileModifier; }
namespace scriptable { class CValueRegistry; }
namespace camera { class CCamera; }
namespace input { class CInputState; }

namespace gui
{
	struct SGUIParams
	{
		std::vector<std::shared_ptr<object::C3DObject>> ObjectList;
		std::shared_ptr<scene::CSceneController> SceneController = nullptr;
		std::shared_ptr<app::CFileModifier> FileModifier = nullptr;
		std::shared_ptr<timeline::CTimelineController> TimelineController = nullptr;
		resource::CLoadWorker* pLoadWorker = nullptr;
		std::map<std::string, std::shared_ptr<scriptable::CValueRegistry>> ValueRegistryList;
		std::string CameraMode = std::string();
		std::shared_ptr<camera::CCamera> Camera = nullptr;
		std::shared_ptr<input::CInputState> InputState = nullptr;

		SGUIParams(const std::vector<std::shared_ptr<object::C3DObject>>& _ObjectList, const std::shared_ptr<scene::CSceneController>& _SceneController,
			const std::shared_ptr<app::CFileModifier>& _FileModifier, const std::shared_ptr<timeline::CTimelineController>& _TimelineController,
			resource::CLoadWorker* _pLoadWorker, const std::map<std::string, std::shared_ptr<scriptable::CValueRegistry>>& _ValueRegistryList)
		{
			ObjectList = _ObjectList;
			SceneController = _SceneController;
			FileModifier = _FileModifier;
			TimelineController = _TimelineController;
			pLoadWorker = _pLoadWorker;
			ValueRegistryList = _ValueRegistryList;
		}
	};
}
#endif