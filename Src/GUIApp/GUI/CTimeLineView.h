#pragma once

#ifdef USE_GUIENGINE
#include <imgui.h>
#include <string>
#include <memory>
#include <vector>
#include <unordered_map>
#include <set>
#include <tuple>

#include <Timeline/CTimelineController.h>
#include "SGUIParams.h"

namespace object { 
	class C3DObject; 
	class CNode;
}

namespace graphics { class CMaterial; }
namespace timeline { class CTimelineController; }
namespace scriptable { class CValueRegistry; }

namespace gui
{
	class CTimeLineView
	{
		//
		const int m_MaxLargeMemoryCount = 20; // 長いメモリの最大数。メモリの数は定数。長いメモリと長いメモリの間に短いメモリが2本あるので長短合わせて最大60本
		const float m_MemoryBarHeight = 40.0f;

		float m_LeftSideMemory; // タイムラインメモリの左端の時間
		float m_RightSideMemory; // タイムラインメモリの右端の時間

		ImVec2 m_LeftSideScreenPos; // 左端のメモリのスクリーン座標
		ImVec2 m_RightSideScreenPos; // 右端のメモリのスクリーン座標

		float m_LargeMemoryWidth; // 現在の長いメモリの間隔. 0.01, 0.1, 1.0, 10.0, 100.0といった感じで変化する
		float m_MemoryExpandRate; // メモリの拡大率

		bool m_FirstClicked;
		ImVec2 m_PrevMousePos;

		bool m_ClickedIndicator;
		float m_IndicatorRate;

		ImVec2 m_MemoryBarCursorPos;
		ImVec2 m_MemoryBarSize;
		ImVec2 m_MemoryBarAvailableSize;

		std::string m_ClickedKeyFrameLabel; // クリックされているキーフレームUIの名前
		std::tuple<std::shared_ptr<animation::CAnimationSampler>, std::shared_ptr<animation::CKeyFrame>> m_ClickedSamplerKeyFramePair; // クリックされているキーフレームそのもの

		// トラックで使用しているオブジェクトリスト
		std::set<std::shared_ptr<object::C3DObject>> m_TrackObjectList;

		// トラックで使用しているValueRegistryリスト
		std::set<std::shared_ptr<scriptable::CValueRegistry>> m_TrackValueRegistryList;

		// ツリーが開いているトラックと描画位置のマップ
		std::unordered_map<std::shared_ptr<timeline::CTimelineTrack>, ImVec2> m_OpenedTrackPosMap;

		// ダイアログの開閉
		bool m_ShowAddPropertyDialog;
		std::shared_ptr<object::C3DObject> m_SelectedObjectForAddObj;

		// Object
		bool m_ShowAddTrackDialog;
		std::shared_ptr<object::C3DObject> m_ClickedObjectForAddObjectTrack;
		std::shared_ptr<object::CNode> m_SelectedNodeForAddTrack;
		std::shared_ptr<graphics::CMaterial> m_SelectedMaterialForAddTrack;

		// Custom(ValueRegistry)
		bool m_ShowAddCustomTrackDialog;
		std::shared_ptr<scriptable::CValueRegistry> m_SelectedValueRegistry;

		//
		std::string m_RemovedTrackID;
	private:
		bool DrawTimeBar(const std::shared_ptr<timeline::CTimelineController>& TimelineController);
		
		bool DrawHierarchyWindow(const std::shared_ptr<timeline::CTimelineController>& TimelineController);
		bool DrawTrackProperty(const std::shared_ptr<timeline::CTimelineController>& TimelineController, const std::string& TrackID, const std::shared_ptr<timeline::CTimelineTrack>& Track,
			const std::vector<std::shared_ptr<animation::CAnimationSampler>>& SamplerList, ImVec2& DstCursorPos);

		bool DrawKeyFrameWindow(const std::shared_ptr<timeline::CTimelineController>& TimelineController);

		bool DrawMemoryBar(const std::shared_ptr<timeline::CTimelineController>& TimelineController);
		bool CalcIndicator(const std::shared_ptr<timeline::CTimelineController>& TimelineController, const ImVec2& cursorPos, const ImVec2& barSize);
		bool DrawIndicator(const ImVec2& cursorPos, const ImVec2& availableSize, const ImVec2& barSize);
		bool DrawKeyFrameList(const std::shared_ptr<timeline::CTimelineController>& TimelineController);

		bool DrawAddPropertyDialog(const std::shared_ptr<timeline::CTimelineController>& TimelineController, const std::vector<std::shared_ptr<object::C3DObject>>& ObjectList, 
			const std::map<std::string, std::shared_ptr<scriptable::CValueRegistry>>& ValueRegistryList);
		
		bool DrawAddObjectTrackDialog(const std::shared_ptr<timeline::CTimelineController>& TimelineController);
		bool DrawNodeDialogView(const std::shared_ptr<timeline::CTimelineController>& TimelineController);
		bool DrawMaterialDialogView(const std::shared_ptr<timeline::CTimelineController>& TimelineController);

		bool DrawAddCustomTrackDialog(const std::shared_ptr<timeline::CTimelineController>& TimelineController, const std::map<std::string, std::shared_ptr<scriptable::CValueRegistry>>& ValueRegistryList);
		bool DrawAddCustomValueDialog(const std::shared_ptr<timeline::CTimelineController>& TimelineController, const std::map<std::string, std::shared_ptr<scriptable::CValueRegistry>>& ValueRegistryList);

		bool CheckWheelExpand();
		bool CheckMemoryDrag(const std::shared_ptr<timeline::CTimelineController>& TimelineController, const ImVec2& availableSize, float DrawMemorySpace, float MaxTime);

		bool CheckIsClickedObjectTree(const std::shared_ptr<object::C3DObject>& Object);
		bool CheckIsClickedCustomTree(const std::shared_ptr<scriptable::CValueRegistry>& ValueRegistry);

		bool UpdateCurrentTimeFromMemoryBar(const std::shared_ptr<timeline::CTimelineController>& TimelineController);
		bool UpdateMemoryFromTimeBar(const std::shared_ptr<timeline::CTimelineController>& TimelineController);

		float GetFirstLargeMemory(float SrcValue, std::vector<bool>& IsLongMemory);
		float GetFirstMemory(float SrcValue);

		float CalcXPosFromFrameTime(float FrameTime);
		float CalcFrameTimeFromXPos(float XPos);

		std::vector<float> GetDefaultValue(math::EValueType ValueType);
		
	public:
		CTimeLineView();
		virtual ~CTimeLineView() = default;

		bool Initialize(const SGUIParams& GUIParams);

		bool Draw(const SGUIParams& GUIParams);
	};
}
#endif