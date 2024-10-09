#pragma once

#ifdef _DEBUG
#include <Scriptable/CComponent.h>
#include <map>

namespace component
{
	class CSDFTextLineGenerator : public scriptable::CComponent
	{
	public:
		CSDFTextLineGenerator(const std::string& ComponentName, const std::string& RegistryName);
		virtual ~CSDFTextLineGenerator();

		virtual bool OnLoaded(api::IGraphicsAPI* pGraphicsAPI, const std::shared_ptr<scene::CSceneController>& SceneController,
			const std::shared_ptr<object::C3DObject>& Object, const std::shared_ptr<object::CNode>& SelfNode) override;
	};
}
#endif