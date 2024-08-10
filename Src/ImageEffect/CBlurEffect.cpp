#include "CBlurEffect.h"
#include <LoadWorker/CLoadWorker.h>
#include <LoadWorker/CMaterialFrameLoader.h>
#include <LoadWorker/CFile.h>
#include <Message/Console.h>
#include <Interface/IGraphicsAPI.h>
#include <Graphics/CTextureSet.h>
#include <Graphics/CMaterialFrame.h>

namespace imageeffect
{
	CBlurEffect::CBlurEffect(api::IGraphicsAPI* pGraphicsAPI):
		m_pGraphicsAPI(pGraphicsAPI),

		m_IsLoaded(false),
		m_KernelSize(0),
		m_BlurMF(std::make_shared<graphics::CMaterialFrame>()),
		m_ScreenObjX(std::make_shared<object::C3DObject>("BlurX", "")),
		m_ScreenObjY(std::make_shared<object::C3DObject>("BlurY", ""))
	{
	}

	bool CBlurEffect::IsLoaded()
	{
		return m_IsLoaded;
	}

	std::shared_ptr<graphics::CTexture> CBlurEffect::GetFrameTexture()
	{
		std::shared_ptr<graphics::CTexture> Tex = nullptr;

		const auto& RenderPass = m_pGraphicsAPI->GetOffScreenRenderPassMap().find("BlurY");
		if (RenderPass != m_pGraphicsAPI->GetOffScreenRenderPassMap().end()) Tex = RenderPass->second->GetFrameTexture();

		return Tex;
	}

	bool CBlurEffect::Create(resource::CLoadWorker* pLoadWorker)
	{
		if (!CalcGaussianKernel()) return false;

		pLoadWorker->AddLoadResource(std::make_shared<resource::CMaterialFrameLoader>("Resources\\MaterialFrame\\Blur_MF.json", m_BlurMF));

		if (!m_pGraphicsAPI->CreateRenderPass("BlurX", api::ERenderPassFormat::COLOR_RENDERPASS, glm::vec4(0.0f, 0.0f, 0.0f, 1.0f), 512, 512)) return false;
		if (!m_pGraphicsAPI->CreateRenderPass("BlurY", api::ERenderPassFormat::COLOR_RENDERPASS, glm::vec4(0.0f, 0.0f, 0.0f, 1.0f), 512, 512)) return false;

		return true;
	}

	bool CBlurEffect::Update(resource::CLoadWorker* pLoadWorker)
	{
		if (!m_IsLoaded)
		{
			if (!pLoadWorker->IsLoaded()) return true;

			if (!Load()) return false;

			m_IsLoaded = true;
		}

		return true;
	}

	bool CBlurEffect::Draw(api::IGraphicsAPI* pGraphicsAPI, const std::shared_ptr<camera::CCamera>& Camera, const std::shared_ptr<projection::CProjection>& Projection,
		const std::shared_ptr<graphics::CDrawInfo>& DrawInfo)
	{
		if (!m_IsLoaded) return true;

		const auto& Tex = m_ScreenObjX->GetTextureSet()->GetFrameTextureList()[0];
		if (!Tex) return true;

		float w = static_cast<float>(Tex->GetWidth());
		float h = static_cast<float>(Tex->GetHeight());

		{
			if (!m_pGraphicsAPI->BeginRender("BlurX")) return false;

			glm::vec2 OffsetV = glm::vec2(1.0f / w, 0.0f);
			m_ScreenObjX->GetMaterialList()[0]->SetUniformValue("Direction", &OffsetV[0], sizeof(glm::vec2));

			if (!m_ScreenObjX->Draw(pGraphicsAPI, false, false, Camera, Projection, DrawInfo)) return false;
			if (!m_pGraphicsAPI->EndRender()) return false;
		}
		
		{
			if (!m_pGraphicsAPI->BeginRender("BlurY")) return false;

			glm::vec2 OffsetV = glm::vec2(0.0f, 1.0f / h);
			m_ScreenObjY->GetMaterialList()[0]->SetUniformValue("Direction", &OffsetV[0], sizeof(glm::vec2));

			if (!m_ScreenObjY->Draw(pGraphicsAPI, false, false, Camera, Projection, DrawInfo)) return false;
			if (!m_pGraphicsAPI->EndRender()) return false;
		}

		return true;
	}

	bool CBlurEffect::CalcGaussianKernel()
	{
		m_GaussianKernel.clear();

		float Sum = 0.0f;
		float sigma = 3.0f;
		float pi = 3.1415f;
		float support = 0.995f;

		std::vector<float> Kernel;

		// radiusはこのように求めると結構適切な値が得られる
		// http://demofox.org/gauss.html
		float radius = glm::ceil(glm::sqrt(-2.0f * sigma * sigma * glm::log(1.0f - support)));

		// ガウスカーネルを計算
		// https://stackoverflow.com/questions/74230190/how-to-calculate-normal-distribution-kernal-for-1d-gaussian-filter
		// https://github.com/lchop/Gaussian_filter_1D_cpp/blob/master/gaussian_filter_1D.cpp#L22
		for (float x = -radius; x <= radius; x++)
		{
			float v = glm::exp(-(x * x) / (2.0f * sigma * sigma)) / (sigma * glm::sqrt(2.0f * pi));
			Sum += v;

			Kernel.push_back(v);
		}

		//
		m_KernelSize = static_cast<int>(Kernel.size());

		// 正規化
		for (auto& v : Kernel)
		{
			v /= Sum;
		}
		
		// 空いた分を0詰めする
		Kernel.resize(32, 0.0f);

		//Console::Log("[CalcGaussianKernel] radius: %f ___________________________________\n", radius);
		//for (int i = 0; i < Kernel.size(); i++){ Console::Log("[%d] %f\n", i, Kernel[i]); }
		//Console::Log("___________________________________________________________________\n");

		// floatのuniform array(float test[32] のような値)は、なぜか一つの要素辺り、16バイトでオフセットされてしまうのでパディングを入れる
		for (const float v : Kernel)
		{
			m_GaussianKernel.push_back(v);
			m_GaussianKernel.push_back(0.0f);
			m_GaussianKernel.push_back(0.0f);
			m_GaussianKernel.push_back(0.0f);
		}

		return true;
	}

	bool CBlurEffect::Load()
	{
		// MaterialX
		auto MaterialX = m_BlurMF->CreateMaterial(m_pGraphicsAPI, 1, graphics::ECullMode::CULL_BACK);
		MaterialX->SetDepthFunc(graphics::EDepthFunc::Always);
		MaterialX->SetCullMode(graphics::ECullMode::CULL_NONE);
		
		MaterialX->ReplacePreloadUniformValue("UseBlur", &glm::ivec1(1)[0], sizeof(glm::ivec1), 0);
		MaterialX->ReplacePreloadUniformValue("KernelSize", &glm::ivec1(m_KernelSize)[0], sizeof(glm::ivec1), 0);
		MaterialX->ReplacePreloadUniformValue("Direction", &glm::vec2(0.0f)[0], sizeof(glm::vec2), 0);

		{
			const auto& RenderPass = m_pGraphicsAPI->GetOffScreenRenderPassMap().find("ShadowPass");
			if (RenderPass != m_pGraphicsAPI->GetOffScreenRenderPassMap().end()) m_ScreenObjX->GetTextureSet()->AddFrameTexture(RenderPass->second->GetFrameTexture());
			MaterialX->ReplaceTextureIndex("SrcTex", 0);
		}

		// MaterialY
		auto MaterialY = m_BlurMF->CreateMaterial(m_pGraphicsAPI, 1, graphics::ECullMode::CULL_BACK);
		MaterialY->SetDepthFunc(graphics::EDepthFunc::Always);
		MaterialY->SetCullMode(graphics::ECullMode::CULL_NONE);

		MaterialY->ReplacePreloadUniformValue("UseBlur", &glm::ivec1(1)[0], sizeof(glm::ivec1), 0);
		MaterialY->ReplacePreloadUniformValue("KernelSize", &glm::ivec1(m_KernelSize)[0], sizeof(glm::ivec1), 0);
		MaterialY->ReplacePreloadUniformValue("Direction", &glm::vec2(0.0f)[0], sizeof(glm::vec2), 0);

		{
			const auto& RenderPass = m_pGraphicsAPI->GetOffScreenRenderPassMap().find("BlurX");
			if (RenderPass != m_pGraphicsAPI->GetOffScreenRenderPassMap().end()) m_ScreenObjY->GetTextureSet()->AddFrameTexture(RenderPass->second->GetFrameTexture());
			MaterialY->ReplaceTextureIndex("SrcTex", 1);
		}

		if (!m_ScreenObjX->CreatePresetSimply(m_pGraphicsAPI, nullptr, graphics::CPresetPrimitive::CreateBoard(m_pGraphicsAPI), graphics::EPresetPrimitiveType::BOARD, MaterialX, nullptr)) return false;
		if (!m_ScreenObjY->CreatePresetSimply(m_pGraphicsAPI, nullptr, graphics::CPresetPrimitive::CreateBoard(m_pGraphicsAPI), graphics::EPresetPrimitiveType::BOARD, MaterialY, nullptr)) return false;

		return true;
	}
}