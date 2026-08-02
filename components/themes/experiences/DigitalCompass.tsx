"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Navigation, MapPin, Smartphone } from "lucide-react";

// Haversine formula to calculate distance between two lat/lngs in km
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

// Calculate bearing from point A to point B
function getBearing(lat1: number, lon1: number, lat2: number, lon2: number) {
   const l1 = lat1 * Math.PI / 180;
   const l2 = lat2 * Math.PI / 180;
   const dl = (lon2 - lon1) * Math.PI / 180;
   const y = Math.sin(dl) * Math.cos(l2);
   const x = Math.cos(l1) * Math.sin(l2) - Math.sin(l1) * Math.cos(l2) * Math.cos(dl);
   const brng = Math.atan2(y, x) * 180 / Math.PI;
   return (brng + 360) % 360;
}

export function DigitalCompass({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ef4444"; // red-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fafafa"]; // neutral-50

  // Target Location (Mock: New York City for example)
  const targetLocation = (config.experience as any)?.location || { lat: 40.7128, lng: -74.0060 };
  
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);
  
  // For the editor preview, we might just mock these if real APIs fail or aren't allowed
  const [isMocking, setIsMocking] = useState(false);

  const initSensors = async () => {
     try {
        // 1. Get Location
        if (navigator.geolocation) {
           navigator.geolocation.getCurrentPosition(
              (pos) => setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
              (err) => { console.warn("Geolocation failed, falling back to mock.", err); enableMock(); }
           );
        } else {
           enableMock();
        }

        // 2. Get Device Orientation (Magnetometer/Compass)
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
           const permission = await (DeviceOrientationEvent as any).requestPermission();
           if (permission === 'granted') {
              window.addEventListener("deviceorientationabsolute", handleOrientation as any);
              // Fallback to normal if absolute isn't supported (iOS hack needed usually for webkitCompassHeading)
              window.addEventListener("deviceorientation", handleOrientation);
              setHasPermissions(true);
           } else {
              enableMock();
           }
        } else {
           window.addEventListener("deviceorientationabsolute", handleOrientation as any);
           window.addEventListener("deviceorientation", handleOrientation);
           setHasPermissions(true);
        }
     } catch (e) {
        enableMock();
     }
  };

  const enableMock = () => {
     setIsMocking(true);
     setHasPermissions(true);
     // Mock starting in Los Angeles
     setCurrentLocation({ lat: 34.0522, lng: -118.2437 });
     
     // Simulate turning around slowly
     setInterval(() => {
        setDeviceHeading(prev => (prev + 1) % 360);
     }, 50);
  };

  const handleOrientation = (e: any) => {
     // iOS compass heading
     if (e.webkitCompassHeading) {
        setDeviceHeading(e.webkitCompassHeading);
     } 
     // Absolute orientation
     else if (e.absolute && e.alpha !== null) {
        setDeviceHeading(360 - e.alpha);
     }
  };

  useEffect(() => {
     return () => {
        window.removeEventListener("deviceorientationabsolute", handleOrientation as any);
        window.removeEventListener("deviceorientation", handleOrientation);
     };
  }, []);

  // Calculations
  let distance = 0;
  let targetBearing = 0;
  let needleRotation = 0;

  if (currentLocation) {
     distance = getDistanceFromLatLonInKm(currentLocation.lat, currentLocation.lng, targetLocation.lat, targetLocation.lng);
     targetBearing = getBearing(currentLocation.lat, currentLocation.lng, targetLocation.lat, targetLocation.lng);
     // The needle should point to the target.
     // If the device is facing North (heading 0), and target is East (bearing 90), needle rotates 90deg relative to phone.
     // If device faces East (heading 90), needle rotates 0deg relative to phone.
     needleRotation = targetBearing - deviceHeading;
  }

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {!hasPermissions ? (
         <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-xl border-4" style={{ borderColor: primaryColor, color: primaryColor }}>
               <MapPin size={40} />
            </div>
            
            <h2 className="text-3xl font-black mb-4 tracking-tight drop-shadow-sm text-slate-900">
               {config.title || "Find me."}
            </h2>
            
            <p className="text-slate-500 font-medium mb-12 text-lg">
               {config.body || "This compass doesn't point North. It points directly to me."}
            </p>

            <button 
               onClick={initSensors}
               className="py-4 px-8 rounded-full font-bold text-white shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-sm"
               style={{ backgroundColor: primaryColor }}
            >
               <Smartphone size={18} /> Enable Sensors
            </button>
            <p className="text-xs text-slate-400 mt-4 max-w-[200px]">Requires Location & Device Orientation access.</p>
         </div>
      ) : (
         <div className="flex-1 flex flex-col items-center justify-center relative w-full h-full">
            
            <div className="text-center mb-16 z-10">
               <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-slate-400 mb-2">Distance</h3>
               <div className="text-5xl font-black text-slate-800 tracking-tighter flex items-end justify-center gap-2">
                  {currentLocation ? distance.toFixed(0) : "---"}
                  <span className="text-xl font-medium text-slate-400 pb-1">km</span>
               </div>
            </div>

            {/* The Compass */}
            <div className="relative w-72 h-72 rounded-full bg-white shadow-2xl border-4 border-slate-100 flex items-center justify-center z-10">
               
               {/* Compass markings (NSEW, just for reference, rotating with device) */}
               <motion.div 
                  className="absolute inset-4 rounded-full border border-slate-200"
                  animate={{ rotate: -deviceHeading }}
                  transition={{ type: "tween", ease: "linear", duration: 0.1 }}
               >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1 font-bold text-slate-300 text-xs">N</div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 mb-0 font-bold text-slate-300 text-xs">S</div>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 ml-1 font-bold text-slate-300 text-xs">W</div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 mr-1 font-bold text-slate-300 text-xs">E</div>
               </motion.div>

               {/* The Needle pointing to Target */}
               <motion.div
                  className="relative w-full h-full flex items-center justify-center"
                  animate={{ rotate: needleRotation }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
               >
                  {/* North/Target pointing half */}
                  <div className="absolute top-8 w-2 h-28 rounded-t-full shadow-lg" style={{ backgroundColor: primaryColor }} />
                  {/* South/Tail half */}
                  <div className="absolute bottom-8 w-2 h-28 rounded-b-full bg-slate-300 shadow-md" />
                  
                  {/* Center pin */}
                  <div className="w-6 h-6 rounded-full bg-white shadow-xl border-4 border-slate-200 z-10" />
               </motion.div>

            </div>

            <div className="mt-16 text-center z-10">
               <p className="text-slate-500 font-serif italic text-lg px-8">
                  "No matter where you are, I know exactly which way to face to think of you."
               </p>
            </div>

            {isMocking && (
               <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-slate-400">
                  (Simulated sensor data)
               </div>
            )}

            {/* Background ambient ring */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
               <div className="w-[150vw] h-[150vw] rounded-full border border-slate-900" style={{ borderColor: primaryColor }} />
            </div>
            
         </div>
      )}

    </div>
  );
}
