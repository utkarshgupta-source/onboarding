import React from 'react';
import { useDrone } from '../context/DroneContext'; 
const TestimonialItem = ({ title, quote, author, role, image, borderClasses }) => (
  <figure className={`flex flex-col items-center justify-center p-8 text-center bg-white border-gray-200 ${borderClasses}`}>
    <blockquote className="max-w-2xl mx-auto mb-4 text-gray-600 lg:mb-5">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </blockquote>
    <figcaption className="flex items-center justify-center">
      <div className="space-y-0.5 text-left rtl:text-right ms-2">
        <div className="leading-tight text-base text-gray-900 font-medium mb-0.5">
          {author} 
          <br/>
          {role}
        </div>
      </div>
    </figcaption>
  </figure>
);

const ControlPanel = () => {
  const { drone } = useDrone(); 
  const testimonials = [
    {
      title: "MODE",
      author: `No. of GPS Satellites: ${drone.gps}`,
      role: `No. of RTK Satellites: ${drone.rtk}`,
      borderClasses: "border-b md:border-e rounded-t-xl md:rounded-t-none md:rounded-ss-xl"
    },
    {
      title: "SYSTEM STATE",
      author: "State: " + (drone.state.armed ?? 'N/A'),
      role: "Quality: " + (drone.quality ?? 'N/A'),
      borderClasses: "border-b md:rounded-se-xl"
    },
  ];

  return (
    <div className="grid mb-8 bg-gray-50 border border-gray-200 rounded-xl shadow-sm md:mb-12 md:grid-cols-2 overflow-hidden">
      {testimonials.map((t, index) => (
        <TestimonialItem key={index} {...t} />
      ))}
    </div>
  );
};

export default ControlPanel;