#pragma once

#ifdef _DEBUG
#include <Scriptable/CComponent.h>
#include <map>

namespace component
{
	class CSDFGenerator : public scriptable::CComponent
	{
	public:
		CSDFGenerator(const std::string& ComponentName, const std::string& RegistryName);
		virtual ~CSDFGenerator();

		virtual bool OnLoaded(api::IGraphicsAPI* pGraphicsAPI, const std::shared_ptr<scene::CSceneController>& SceneController,
			const std::shared_ptr<object::C3DObject>& Object, const std::shared_ptr<object::CNode>& SelfNode) override;
	};
}
#endif // _DEBUG