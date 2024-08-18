#ifdef USE_GUIENGINE
#include "C3DView.h"

namespace gui
{
	C3DView::C3DView():
		m_IsFullScreen(true),
		m_SelectedPassName(std::string()),
		m_SelectedTextureIndex(0)
	{
	}

	bool C3DView::IsFullScreen() const
	{
		return m_IsFullScreen;
	}

	void C3DView::SetDefaultPass(const std::string& RenderPass, const std::string& DepthPass)
	{
		m_SelectedPassName = RenderPass;
	}

	bool C3DView::Draw(api::IGraphicsAPI* pGraphicsAPI, const SGUIParams& GUIParams, const std::shared_ptr<gui::IGUIEngine>& GUIEngine, const ImVec2& WindowSize, const ImVec2& FullImageSize)
	{
		// F2キーでフルスクリーン描画かリスト描画かを切り替える
		if (ImGui::IsKeyReleased(ImGuiKey_F2))
		{
			m_IsFullScreen = !m_IsFullScreen;
		}

		const float Rate = 0.025f;

		if (!DrawOption(ImVec2(WindowSize.x , WindowSize.y * Rate))) return false;

		if (m_IsFullScreen)
		{
			if (!DrawFullScreen(pGraphicsAPI, GUIParams, GUIEngine, ImVec2(WindowSize.x, WindowSize.y * (1.0f - Rate)), FullImageSize)) return false;
		}
		else
		{
			if (!DrawPassList(pGraphicsAPI, GUIParams, GUIEngine, ImVec2(WindowSize.x, WindowSize.y * (1.0f - Rate)), FullImageSize)) return false;
		}

		return true;
	}

	bool C3DView::DrawOption(const ImVec2& WindowSize)
	{
		if (ImGui::BeginChild("C3DView::DrawOption", WindowSize))
		{
			// たぶんボタンの最小サイズみたいなのでWindowを小さくしすぎると見えなくなるみたい(いったん仕様とする。普段使いには支障がないため)
			std::string WindowModeLavel = (m_IsFullScreen ? "RenderPassList" : "RenderPassView");
			WindowModeLavel += "##C3DView::DrawOption";

			if (ImGui::Button(WindowModeLavel.c_str(), ImVec2(0, WindowSize.y)))
			{
				m_IsFullScreen = !m_IsFullScreen;
			}

			ImGui::EndChild();
		}

		return true;
	}

	bool C3DView::DrawFullScreen(api::IGraphicsAPI* pGraphicsAPI, const SGUIParams& GUIParams, const std::shared_ptr<gui::IGUIEngine>& GUIEngine, const ImVec2& WindowSize, const ImVec2& FullImageSize)
	{
		// フルスクリーン中はインプットを受け取らない
		ImGuiWindowFlags flags = ImGuiWindowFlags_NoMove | ImGuiWindowFlags_NoResize | ImGuiWindowFlags_NoSavedSettings |
			ImGuiWindowFlags_NoTitleBar | ImGuiWindowFlags_NoScrollbar | ImGuiWindowFlags_NoInputs;

		if(ImGui::BeginChild("C3DView::DrawFullScreen", ImVec2(0, 0), 0, flags))
		{
			auto RenderPass = pGraphicsAPI->FindOffScreenRenderPass(m_SelectedPassName);

			auto Core = GUIEngine->GetImGuiCore();

			if (RenderPass && Core)
			{
				// 親ウィンドウの中心に配置
				ImVec2 ImagePos = ImVec2(
					(WindowSize.x - FullImageSize.x) * 0.5f,
					(WindowSize.y - FullImageSize.y) * 0.5f
				);
				ImGui::SetCursorPos(ImagePos);

				ImVec2 UV0 = ImVec2(0.0f, 0.0f);
				ImVec2 UV1 = ImVec2(1.0f, 1.0f);
#ifdef USE_OPENGL
				// OpenGL時は上下反転するので補正する
				UV0 = ImVec2(0.0f, 1.0f);
				UV1 = ImVec2(1.0f, 0.0f);
#endif // USE_OPENGL

				const auto& FrameTexture = RenderPass->GetFrameTexture(m_SelectedTextureIndex);
				if (!FrameTexture) return true;

				ImGui::Image(Core->CastTexID(FrameTexture.get()), FullImageSize, UV0, UV1);
			}

			ImGui::EndChild();
		}

		return true;
	}

	bool C3DView::DrawPassList(api::IGraphicsAPI* pGraphicsAPI, const SGUIParams& GUIParams, const std::shared_ptr<gui::IGUIEngine>& GUIEngine, const ImVec2& WindowSize, const ImVec2& FullImageSize)
	{
		ImGuiWindowFlags flags = ImGuiWindowFlags_NoMove | ImGuiWindowFlags_NoResize | ImGuiWindowFlags_NoSavedSettings |
			ImGuiWindowFlags_NoTitleBar | ImGuiWindowFlags_NoScrollbar;

		if (ImGui::BeginChild("C3DView::DrawPassList", ImVec2(0, 0), 0, flags))
		{
			auto Core = GUIEngine->GetImGuiCore();
			if (!Core) return true;

			// 横に何枚まで並べるか
			const float SideOrderCount = 5.0f;

			ImVec2 UV0 = ImVec2(0.0f, 0.0f);
			ImVec2 UV1 = ImVec2(1.0f, 1.0f);
#ifdef USE_OPENGL
			// OpenGL時は上下反転するので補正する
			UV0 = ImVec2(0.0f, 1.0f);
			UV1 = ImVec2(1.0f, 0.0f);
#endif // USE_OPENGL

			const ImVec2 ImageSize = ImVec2(FullImageSize.x / SideOrderCount, FullImageSize.y / SideOrderCount);

			//
			int RenderPassIndex = 0;
			float TexCount = 0.0f;

			const ImVec2 CursorScreenPos = ImGui::GetCursorScreenPos();

			float XIndex = 0.0f;
			float YIndex = 0.0f;

			// PassNameのサイズ
			const float PassNameHeight = 25.0f;

			for (const auto& RenderPassPair : pGraphicsAPI->GetOffScreenRenderPassMap())
			{
				const auto& PassName = RenderPassPair.first;
				const auto& RenderPass = RenderPassPair.second;

				const auto& FrameTextureList = RenderPass->GetFrameTextureList();

				for (int TextureIndex = 0; TextureIndex < static_cast<int>(FrameTextureList.size()); TextureIndex++)
				{
					const auto& FrameTexture = FrameTextureList[TextureIndex];

					//
					ImVec2 DrawCursorScreenPos = ImVec2(CursorScreenPos.x + ImageSize.x * XIndex, CursorScreenPos.y + (ImageSize.y + PassNameHeight * 1.5f) * YIndex);
					ImGui::SetCursorScreenPos(DrawCursorScreenPos);

					if (ImGui::ImageButton(Core->CastTexID(FrameTexture.get()), ImageSize, UV0, UV1, 1))
					{
						m_IsFullScreen = true;

						m_SelectedPassName = PassName;
						m_SelectedTextureIndex = TextureIndex;
					}

					//
					DrawCursorScreenPos.y += (ImageSize.y + PassNameHeight * 0.5f);
					ImGui::SetCursorScreenPos(DrawCursorScreenPos);

					std::string LabelText = PassName + "_" + std::to_string(TextureIndex);
					ImGui::Text(LabelText.c_str());

					TexCount++;

					XIndex++;
					if (XIndex >= SideOrderCount)
					{
						XIndex = 0.0f;
						YIndex++;
					}
				}

				RenderPassIndex++;
			}

			ImGui::EndChild();
		}

		return true;
	}
}
#endif // USE_GUIENGINE