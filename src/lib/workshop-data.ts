export interface WorkshopTopic {
  id: string;
  title: string;
  description: string;
}

export interface TimeSlot {
  id: string;
  time: string;
  topics: WorkshopTopic[];
}

export const WORKSHOP_DATA: TimeSlot[] = [
  {
    id: 'slot1',
    time: '09:00 - 10:20',
    topics: [
      {
        id: 'imaging-slot1',
        title: 'Imaging (Wojciech Kosmala)',
        description: 'Cardiac imaging techniques and applications (Wojciech Kosmala)'
      },
      {
        id: 'interventional-cardiology-slot1',
        title: 'Interventional Cardiology (Krzysztof Reczuch)',
        description: 'Interventional procedures and techniques (Krzysztof Reczuch)'
      },
      {
        id: 'intensive-care-slot1',
        title: 'Intensive Care (Robert Zymliński)',
        description: 'Critical care cardiology and management (Robert Zymliński)'
      },
      {
        id: 'heart-transplantation-slot1',
        title: 'Heart Transplantation and Mechanical Circulatory Support (Michał Zakliczyński)',
        description: 'Advanced heart failure and transplant procedures (Michał Zakliczyński)'
      },
      {
        id: 'electrophysiology-slot1',
        title: 'Electrophysiology (Krzysztof Nowak)',
        description: 'Cardiac rhythm disorders and electrophysiology (Krzysztof Nowak)'
      },
      {
        id: 'one-day-cardiology-slot1',
        title: '"One-day" Cardiology Care (Małgorzata Kobusiak-Prokopowicz)',
        description: 'Outpatient cardiology services and management (Małgorzata Kobusiak-Prokopowicz)'
      }
    ]
  },
  {
    id: 'slot2',
    time: '10:40 - 12:00',
    topics: [
      {
        id: 'imaging-slot2',
        title: 'Imaging (Wojciech Kosmala)',
        description: 'Cardiac imaging techniques and applications (Wojciech Kosmala)'
      },
      {
        id: 'interventional-cardiology-slot2',
        title: 'Interventional Cardiology (Krzysztof Reczuch)',
        description: 'Interventional procedures and techniques (Krzysztof Reczuch)'
      },
      {
        id: 'intensive-care-slot2',
        title: 'Intensive Care (Robert Zymliński)',
        description: 'Critical care cardiology and management (Robert Zymliński)'
      },
      {
        id: 'heart-transplantation-slot2',
        title: 'Heart Transplantation and Mechanical Circulatory Support (Michał Zakliczyński)',
        description: 'Advanced heart failure and transplant procedures (Michał Zakliczyński)'
      },
      {
        id: 'electrophysiology-slot2',
        title: 'Electrophysiology (Krzysztof Nowak)',
        description: 'Cardiac rhythm disorders and electrophysiology (Krzysztof Nowak)'
      },
      {
        id: 'one-day-cardiology-slot2',
        title: '"One-day" Cardiology Care (Małgorzata Kobusiak-Prokopowicz)',
        description: 'Outpatient cardiology services and management (Małgorzata Kobusiak-Prokopowicz)'
      }
    ]
  },
  {
    id: 'slot3',
    time: '12:00 - 13:20',
    topics: [
      {
        id: 'imaging-slot3',
        title: 'Imaging (Wojciech Kosmala)',
        description: 'Cardiac imaging techniques and applications (Wojciech Kosmala)'
      },
      {
        id: 'interventional-cardiology-slot3',
        title: 'Interventional Cardiology (Krzysztof Reczuch)',
        description: 'Interventional procedures and techniques (Krzysztof Reczuch)'
      },
      {
        id: 'intensive-care-slot3',
        title: 'Intensive Care (Robert Zymliński)',
        description: 'Critical care cardiology and management (Robert Zymliński)'
      },
      {
        id: 'heart-transplantation-slot3',
        title: 'Heart Transplantation and Mechanical Circulatory Support (Michał Zakliczyński)',
        description: 'Advanced heart failure and transplant procedures (Michał Zakliczyński)'
      },
      {
        id: 'electrophysiology-slot3',
        title: 'Electrophysiology (Krzysztof Nowak)',
        description: 'Cardiac rhythm disorders and electrophysiology (Krzysztof Nowak)'
      },
      {
        id: 'one-day-cardiology-slot3',
        title: '"One-day" Cardiology Care (Małgorzata Kobusiak-Prokopowicz)',
        description: 'Outpatient cardiology services and management (Małgorzata Kobusiak-Prokopowicz)'
      }
    ]
  }
];

export const getTopicById = (slotId: string, topicId: string): WorkshopTopic | undefined => {
  const slot = WORKSHOP_DATA.find(s => s.id === slotId);
  return slot?.topics.find(t => t.id === topicId);
}; 