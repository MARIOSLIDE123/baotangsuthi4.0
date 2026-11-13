import React, { useState } from 'react';
import { ChevronDown, ChevronRight, GitBranch } from 'lucide-react';
import { EPIC_MIND_MAP } from '../../data/literaryCurriculumData';
import { MindMapNode } from '../../types/museum';

export const EpicMindMap: React.FC = () => {
  const [expandedIds, setExpandedIds] = useState<string[]>([
    'root-epic',
    'branch-origin',
    'branch-hero',
  ]);
  const [selectedNode, setSelectedNode] = useState<MindMapNode>(EPIC_MIND_MAP);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const expandAll = () => {
    const allIds: string[] = [EPIC_MIND_MAP.id];
    EPIC_MIND_MAP.children?.forEach((branch) => {
      allIds.push(branch.id);
    });
    setExpandedIds(allIds);
  };

  const collapseAll = () => {
    setExpandedIds([EPIC_MIND_MAP.id]);
  };

  return (
    <section className="bg-cream border border-sandstone rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sandstone pb-4">
        <div className="flex items-center gap-2.5">
          <GitBranch className="w-5 h-5 text-forest-700" />
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-wood-900">
              Sơ đồ tư duy tương tác thể loại Sử thi
            </h2>
            <p className="text-xs sm:text-sm text-wood-700">
              Nhấp vào từng nhánh để mở rộng hoặc thu gọn kiến thức trọng tâm.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={expandAll}
            className="px-3 py-1.5 text-xs font-semibold bg-parchment border border-sandstone rounded-lg hover:border-gold-500 cursor-pointer"
          >
            Mở tất cả
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="px-3 py-1.5 text-xs font-semibold bg-parchment border border-sandstone rounded-lg hover:border-gold-500 cursor-pointer"
          >
            Thu gọn
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive Tree */}
        <div className="lg:col-span-7 space-y-3">
          {/* Root Node */}
          <div className="p-4 rounded-xl bg-wood-900 text-cream flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setSelectedNode(EPIC_MIND_MAP)}
              className="font-serif text-xl font-bold text-gold-400 text-left cursor-pointer"
            >
              {EPIC_MIND_MAP.label}
            </button>
            <button
              type="button"
              onClick={() => toggleExpand(EPIC_MIND_MAP.id)}
              className="p-1.5 rounded-md bg-wood-800 hover:bg-wood-700 text-cream cursor-pointer"
              aria-label="Mở hoặc thu gọn gốc sơ đồ"
            >
              {expandedIds.includes(EPIC_MIND_MAP.id) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Branches */}
          {expandedIds.includes(EPIC_MIND_MAP.id) && (
            <div className="pl-4 sm:pl-6 space-y-3 border-l border-sandstone ml-4">
              {EPIC_MIND_MAP.children?.map((branch) => {
                const isOpen = expandedIds.includes(branch.id);
                const isSelected = selectedNode.id === branch.id;
                return (
                  <div key={branch.id} className="space-y-2">
                    <div
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                        isSelected
                          ? 'bg-parchment border-forest-700'
                          : 'bg-cream border-sandstone hover:border-gold-500'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedNode(branch);
                          if (!isOpen) toggleExpand(branch.id);
                        }}
                        className="text-sm font-bold text-wood-900 text-left flex-1 cursor-pointer"
                      >
                        {branch.label}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleExpand(branch.id)}
                        className="p-1.5 rounded-md bg-parchment hover:bg-sandstone/70 text-wood-800 cursor-pointer"
                        aria-label={`Mở hoặc thu gọn ${branch.label}`}
                      >
                        {isOpen ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {isOpen && branch.children && (
                      <div className="pl-4 sm:pl-6 space-y-2 border-l border-sandstone ml-3">
                        {branch.children.map((leaf) => {
                          const leafSelected = selectedNode.id === leaf.id;
                          return (
                            <button
                              key={leaf.id}
                              type="button"
                              onClick={() => setSelectedNode(leaf)}
                              className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-colors cursor-pointer ${
                                leafSelected
                                  ? 'bg-forest-700 text-cream border-forest-700 font-semibold'
                                  : 'bg-parchment/60 text-wood-800 border-sandstone hover:border-gold-500'
                              }`}
                            >
                              {leaf.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Node Detail Card */}
        <aside className="lg:col-span-5 bg-parchment/80 border border-sandstone rounded-xl p-6 space-y-3">
          <p className="text-xs font-semibold text-forest-800">Chi tiết nút kiến thức đang chọn</p>
          <h3 className="font-serif text-2xl font-bold text-wood-900">{selectedNode.label}</h3>
          <p className="text-sm text-wood-800 leading-relaxed">{selectedNode.note}</p>
        </aside>
      </div>
    </section>
  );
};
