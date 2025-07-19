import React from 'react';
import { BookOpen, Clock, Users, User } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

interface PathsalaLevelProps {
  params: {
    level: string;
  };
}

const PathsalaLevel: React.FC<PathsalaLevelProps> = ({ params }) => {
  const { level } = params;
  
  const levelData: Record<string, any> = {
    'level-1': {
      title: 'Foundation Level',
      ageGroup: '5-7 years',
      duration: '1 hour',
      students: 15,
      teacher: 'Ms. Priya Jain',
      description: 'Introduction to Jain principles and basic prayers for young children.',
      syllabus: [
        'Basic Jain prayers (Namokara Mantra)',
        'Simple stories of Tirthankaras',
        'Introduction to Ahimsa (non-violence)',
        'Basic Jain festivals and their significance',
        'Simple meditation and breathing exercises'
      ],
      timings: {
        start: '10:00 AM',
        end: '11:00 AM',
        breakTime: '10:30 AM - 10:40 AM'
      },
      resources: [
        'Jain Prayer Book (Level 1)',
        'Story books with colorful illustrations',
        'Activity worksheets',
        'Art and craft materials'
      ]
    },
    'level-2': {
      title: 'Elementary Level',
      ageGroup: '8-9 years',
      duration: '1.5 hours',
      students: 18,
      teacher: 'Mr. Rajesh Shah',
      description: 'Stories of Tirthankaras and basic Jain history for elementary students.',
      syllabus: [
        'Detailed stories of first five Tirthankaras',
        'Basic Jain history and geography',
        'Understanding of Five Vratas (vows)',
        'Jain festivals and their celebrations',
        'Simple philosophical concepts'
      ],
      timings: {
        start: '10:00 AM',
        end: '11:30 AM',
        breakTime: '10:45 AM - 11:00 AM'
      },
      resources: [
        'Jain History Book (Elementary)',
        'Tirthankara Story Collection',
        'Interactive games and puzzles',
        'Audio-visual materials'
      ]
    },
    'level-3': {
      title: 'Intermediate Level',
      ageGroup: '10-11 years',
      duration: '1.5 hours',
      students: 20,
      teacher: 'Dr. Meera Kothari',
      description: 'Understanding of Five Vratas and deeper Jain philosophy.',
      syllabus: [
        'Detailed study of Five Vratas',
        'Stories of all 24 Tirthankaras',
        'Basic understanding of Karma theory',
        'Jain scriptures introduction',
        'Community service projects'
      ],
      timings: {
        start: '10:00 AM',
        end: '11:30 AM',
        breakTime: '10:45 AM - 11:00 AM'
      },
      resources: [
        'Five Vratas Study Guide',
        'Tirthankara Biography Collection',
        'Karma Theory Simplified',
        'Community service handbook'
      ]
    },
    'level-4': {
      title: 'Advanced Basics',
      ageGroup: '12-13 years',
      duration: '2 hours',
      students: 16,
      teacher: 'Prof. Amit Jain',
      description: 'Deeper study of Jain scriptures and practices.',
      syllabus: [
        'Introduction to Jain scriptures (Agamas)',
        'Advanced understanding of Karma',
        'Jain art and architecture',
        'Comparative philosophy',
        'Leadership skills development'
      ],
      timings: {
        start: '10:00 AM',
        end: '12:00 PM',
        breakTime: '11:00 AM - 11:15 AM'
      },
      resources: [
        'Jain Scriptures (Selected texts)',
        'Karma Philosophy Guide',
        'Art and Architecture book',
        'Leadership activity manual'
      ]
    },
    'level-5': {
      title: 'Philosophy Level',
      ageGroup: '14-15 years',
      duration: '2 hours',
      students: 12,
      teacher: 'Dr. Sunita Mehta',
      description: 'Advanced Jain philosophy and ethical discussions.',
      syllabus: [
        'Deep dive into Jain philosophy',
        'Ethical dilemmas and discussions',
        'Modern application of Jain principles',
        'Interfaith dialogue preparation',
        'Research projects on Jain topics'
      ],
      timings: {
        start: '10:00 AM',
        end: '12:00 PM',
        breakTime: '11:00 AM - 11:15 AM'
      },
      resources: [
        'Advanced Philosophy Texts',
        'Ethics Case Studies',
        'Modern Jainism Books',
        'Research methodology guide'
      ]
    },
    'level-6': {
      title: 'Leadership Level',
      ageGroup: '16-17 years',
      duration: '2 hours',
      students: 8,
      teacher: 'Mr. Vikram Jain',
      description: 'Training for community leadership and service.',
      syllabus: [
        'Community leadership skills',
        'Event planning and management',
        'Public speaking and presentation',
        'Volunteer management',
        'Fundraising and project management'
      ],
      timings: {
        start: '10:00 AM',
        end: '12:00 PM',
        breakTime: '11:00 AM - 11:15 AM'
      },
      resources: [
        'Leadership Training Manual',
        'Event Planning Toolkit',
        'Communication Skills Guide',
        'Project Management Resources'
      ]
    },
    'level-7': {
      title: 'Advanced Studies',
      ageGroup: '18+ years',
      duration: '2.5 hours',
      students: 6,
      teacher: 'Acharya Shri Vijay Kumar',
      description: 'In-depth scripture study and teaching preparation.',
      syllabus: [
        'Advanced scripture study',
        'Teaching methodology',
        'Sanskrit language basics',
        'Historical research methods',
        'Thesis preparation'
      ],
      timings: {
        start: '9:30 AM',
        end: '12:00 PM',
        breakTime: '10:45 AM - 11:00 AM'
      },
      resources: [
        'Original Sanskrit Texts',
        'Teaching Methodology Book',
        'Research Papers Collection',
        'Thesis Writing Guide'
      ]
    }
  };

  const currentLevel = levelData[level];
  const levelNumber = level.replace('level-', '');

  if (!currentLevel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <Navbar />
        <main>
          <div className="pt-16 min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Level Not Found</h1>
              <p className="text-gray-600">The requested Pathshala level does not exist.</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <Navbar />
      <main>
        <div className="pt-16">
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Pathshala Level {levelNumber}
              </h1>
              <h2 className="text-2xl mb-4">{currentLevel.title}</h2>
              <p className="text-xl opacity-90 max-w-3xl mx-auto">
                {currentLevel.description}
              </p>
            </div>
          </div>

          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Class Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center">
                        <Users className="h-6 w-6 text-orange-600 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">Age Group</p>
                          <p className="text-gray-600">{currentLevel.ageGroup}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-6 w-6 text-orange-600 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">Duration</p>
                          <p className="text-gray-600">{currentLevel.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <User className="h-6 w-6 text-orange-600 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">Teacher</p>
                          <p className="text-gray-600">{currentLevel.teacher}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="h-6 w-6 text-orange-600 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">Enrolled Students</p>
                          <p className="text-gray-600">{currentLevel.students} students</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Syllabus</h3>
                    <div className="space-y-3">
                      {currentLevel.syllabus.map((item: string, index: number) => (
                        <div key={index} className="flex items-start">
                          <div className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm mr-3 mt-1">
                            {index + 1}
                          </div>
                          <p className="text-gray-700">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-lg p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Class Resources</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentLevel.resources.map((resource: string, index: number) => (
                        <div key={index} className="flex items-center bg-orange-50 p-4 rounded-lg">
                          <BookOpen className="h-5 w-5 text-orange-600 mr-3" />
                          <span className="text-gray-700">{resource}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Class Timings</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="font-medium">Start Time</span>
                        <span className="text-gray-600">{currentLevel.timings.start}</span>
                      </div>
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="font-medium">End Time</span>
                        <span className="text-gray-600">{currentLevel.timings.end}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Break Time</span>
                        <span className="text-gray-600">{currentLevel.timings.breakTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Interested in Joining?</h3>
                    <p className="text-gray-600 mb-4">
                      Register for this level or contact us for more information about our Pathshala program.
                    </p>
                    <div className="space-y-3">
                      <a
                        href="/membership"
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-center block"
                      >
                        Register Now
                      </a>
                      <a
                        href="/feedback"
                        className="w-full bg-white hover:bg-gray-50 text-orange-600 border border-orange-600 py-2 px-4 rounded-lg font-medium transition-colors text-center block"
                      >
                        Ask Questions
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PathsalaLevel;