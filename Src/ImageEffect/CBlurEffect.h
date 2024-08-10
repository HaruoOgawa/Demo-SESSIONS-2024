#pragma once

#include <vector>
#include <memory>
#include <glm/glm.hpp>
#include <Object/C3DObject.h>

namespace file { class CFile; }
namespace api { class IGraphicsAPI; }
namespace object { class C3DObject; }
namespace resource { class CLoadWorker; }
namespace graphics { 
	class CTextureSet; 
	class CMaterialFrame;
}

namespace imageeffect
{
	class CBlurEffect
	{
		api::IGraphicsAPI* m_pGraphicsAPI;

		int m_KernelSize;
		std::vector<float> m_GaussianKernel;

		bool m_IsLoaded;

		std::shared_ptr<graphics::CMaterialFrame> m_BlurMF;

		std::shared_ptr<object::C3DObject> m_ScreenObjX;
		std::shared_ptr<object::C3DObject> m_ScreenObjY;
	private:
		bool CalcGaussianKernel();
		bool Load();
	public:
		CBlurEffect(api::IGraphicsAPI* pGraphicsAPI);
		virtual ~CBlurEffect() = default;

		bool IsLoaded();

		std::shared_ptr<graphics::CTexture> GetFrameTexture();

		bool Create(resource::CLoadWorker* pLoadWorker);

		bool Update(resource::CLoadWorker* pLoadWorker);

		bool Draw(api::IGraphicsAPI* pGraphicsAPI, const std::shared_ptr<camera::CCamera>& Camera, const std::shared_ptr<projection::CProjection>& Projection,
			const std::shared_ptr<graphics::CDrawInfo>& DrawInfo);
	};
}