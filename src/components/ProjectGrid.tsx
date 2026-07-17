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
      <div className="flex justify-center gap-4 mb-8">
        <button
          className={`px-4 py-2 rounded-full font-label-md transition-colors ${filter === 'all' ? 'bg-primary-container text-on-primary' : 'bg-surface-raised text-on-surface-variant hover:bg-surface-raised/80 hover:text-primary'}`}
          onClick={() => setFilter('all')}
        >
          {filterAllStr}
        </button>
        <button
          className={`px-4 py-2 rounded-full font-label-md transition-colors ${filter === 'project' ? 'bg-primary-container text-on-primary' : 'bg-surface-raised text-on-surface-variant hover:bg-surface-raised/80 hover:text-primary'}`}
          onClick={() => setFilter('project')}
        >
          {filterProjectStr}
        </button>
        <button
          className={`px-4 py-2 rounded-full font-label-md transition-colors ${filter === 'certificate' ? 'bg-primary-container text-on-primary' : 'bg-surface-raised text-on-surface-variant hover:bg-surface-raised/80 hover:text-primary'}`}
          onClick={() => setFilter('certificate')}
        >
          {filterCertStr}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item, idx) => (
          <div key={idx} className="glass-panel rounded-xl overflow-hidden group hover:scale-[1.02] transition-all duration-300 flex flex-col">
            <div className={`relative h-48 w-full overflow-hidden ${item.type === 'certificate' ? 'bg-surface-deep flex items-center justify-center p-4' : ''}`}>
              <img 
                alt={item.title} 
                className={`${item.type === 'certificate' ? 'max-h-full object-contain' : 'absolute inset-0 w-full h-full object-cover'} transition-transform group-hover:scale-110`} 
                src={item.image}
              />
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="font-headline-sm text-headline-sm text-text-primary mb-2">{item.title}</h3>
              <p className="font-body-md text-body-md text-text-secondary mb-4 flex-1">{item.desc}</p>
              {item.link && item.link !== '#' && (
                <a className="text-primary font-label-md text-label-md inline-flex items-center hover:underline" href={item.link} target="_blank" rel="noreferrer">
                  {item.type === 'project' ? 'Lihat Project' : 'Lihat Sertifikat'} <span className="material-symbols-outlined ml-1 text-sm">arrow_forward</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
