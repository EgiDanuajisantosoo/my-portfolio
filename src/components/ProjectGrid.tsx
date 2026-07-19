'use client';

import React, { useState } from 'react';

type ProjectItem = {
  type: string;
  title: string;
  desc: string;
  image: string;
  link: string;
};

export default function ProjectGrid({ 
  items, 
  filterAllStr = "Semua", 
  filterProjectStr = "Project", 
  filterCertStr = "Sertifikasi" 
}: { 
  items: ProjectItem[],
  filterAllStr?: string,
  filterProjectStr?: string,
  filterCertStr?: string
}) {
  const [filter, setFilter] = useState<'all' | 'project' | 'certificate'>('all');
  const filteredItems = filter === 'all' ? items : items.filter((item) => item.type === filter);

  return (
    <>
      <div className="flex justify-center gap-6 mb-12">
        <button
          className={`px-8 py-3 rounded-full font-label-md uppercase tracking-[2.5px] text-[14px] transition-all duration-300 transform hover:scale-105 border ${filter === 'all' ? 'border-primary bg-primary text-on-primary' : 'border-outline text-text-secondary hover:bg-secondary hover:text-on-secondary hover:border-secondary'}`}
          onClick={() => setFilter('all')}
        >
          {filterAllStr}
        </button>
        <button
          className={`px-8 py-3 rounded-full font-label-md uppercase tracking-[2.5px] text-[14px] transition-all duration-300 transform hover:scale-105 border ${filter === 'project' ? 'border-primary bg-primary text-on-primary' : 'border-outline text-text-secondary hover:bg-secondary hover:text-on-secondary hover:border-secondary'}`}
          onClick={() => setFilter('project')}
        >
          {filterProjectStr}
        </button>
        <button
          className={`px-8 py-3 rounded-full font-label-md uppercase tracking-[2.5px] text-[14px] transition-all duration-300 transform hover:scale-105 border ${filter === 'certificate' ? 'border-primary bg-primary text-on-primary' : 'border-outline text-text-secondary hover:bg-secondary hover:text-on-secondary hover:border-secondary'}`}
          onClick={() => setFilter('certificate')}
        >
          {filterCertStr}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
        {filteredItems.map((item, idx) => (
          <div key={idx} className="bg-background border border-outline rounded-none overflow-hidden group flex flex-col hover:border-secondary transition-all duration-300 transform hover:scale-[1.02]">
            <div className={`relative h-64 w-full overflow-hidden ${item.type === 'certificate' ? 'bg-surface-container flex items-center justify-center p-8' : 'bg-background'}`}>
              <img 
                alt={item.title} 
                className={`transition-all duration-700 grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 ${item.type === 'certificate' ? 'max-h-full object-contain' : 'absolute inset-0 w-full h-full object-cover'}`} 
                src={item.image}
              />
            </div>
            <div className="p-8 flex-1 flex flex-col bg-surface-container">
              <h3 className="font-display text-[24px] uppercase tracking-[1.5px] text-text-primary mb-4 leading-tight group-hover:text-secondary group-hover:scale-105 origin-left inline-block transition-all duration-300">{item.title}</h3>
              <p className="font-body-md text-text-secondary group-hover:text-secondary group-hover:scale-105 origin-left inline-block transition-all duration-300 mb-8 flex-1">{item.desc}</p>
              {item.link && item.link !== '#' && (
                <a className="text-link font-label-md uppercase tracking-[2px] text-[12px] inline-flex items-center hover:text-secondary transition-colors mt-auto" href={item.link} target="_blank" rel="noreferrer">
                  {item.type === 'project' ? 'Lihat Project' : 'Lihat Sertifikat'} <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
