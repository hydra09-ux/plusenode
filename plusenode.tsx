"use client"

import { useState, useEffect, useRef, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Text, Environment, useCursor } from '@react-three/drei'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Cpu, Server, Shield, Zap, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from "@/components/ui/use-toast"
import * as THREE from 'three'

const STARTUP_MESSAGES = [
  "Current version: 0.0.3 - made with <3 by PulseNode Team",
  "[Website Info]: Welcome to pulsenode.net! Currently running on latest version (0.0.3)",
  "[Website Info]: Wrapping everything up...",
  "[Website Info]: Loading landing page",
  "[Website Info]: Loading assets",
  "[Website Info]: Starting web server on 0.0.0.0:443",
  "[Website Info]: Preparing web server: 62%",
  "[Website Info]: Preparing web server: 84%",
  "[Website Info]: Done (0.231s)! Type \"help\" or \"?\" for help"
]

const AVAILABLE_COMMANDS = [
  "/help",
  "/status",
  "/plans",
  "/uptime",
  "/specs",
  "/support",
  "/discord",
  "/tutorials",
  "/social"
]

const features = [
  { icon: Cpu, title: "High Performance", description: "Blazing fast servers with the latest hardware" },
  { icon: Server, title: "99.9% Uptime", description: "Reliable hosting with minimal downtime" },
  { icon: Shield, title: "DDoS Protection", description: "Advanced protection against DDoS attacks" },
  { icon: Zap, title: "Instant Setup", description: "Get your server up and running in seconds" },
]

const plans = [
  { name: "Basic", ram: "2GB", cpu: "1 vCPU", storage: "20GB SSD", price: 5 },
  { name: "Standard", ram: "4GB", cpu: "2 vCPU", storage: "40GB SSD", price: 10 },
  { name: "Premium", ram: "8GB", cpu: "4 vCPU", storage: "80GB SSD", price: 20 },
]

function Blob({ position, scale, color }) {
  const mesh = useRef()
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    mesh.current.position.y = position[1] + Math.sin(t) * 0.1
    mesh.current.scale.x = scale[0] + Math.sin(t) * 0.1
    mesh.current.scale.y = scale[1] + Math.sin(t + 1) * 0.1
    mesh.current.scale.z = scale[2] + Math.sin(t + 2) * 0.1
  })

  return (
    <mesh
      ref={mesh}
      position={position}
      scale={scale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
    </mesh>
  )
}

function Background() {
  const { viewport } = useThree()

  return (
    <>
      <Blob position={[-2, 0, -5]} scale={[3, 3, 3]} color="#ff4136" />
      <Blob position={[2, -1, -5]} scale={[2, 2, 2]} color="#0074D9" />
      <Blob position={[0, 2, -5]} scale={[2.5, 2.5, 2.5]} color="#2ECC40" />
    </>
  )
}

function AnimatedText({ text, position, fontSize = 0.5 }) {
  const meshRef = useRef()

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    meshRef.current.position.y = position[1] + Math.sin(time * 2) * 0.05
  })

  return (
    <Text
      ref={meshRef}
      position={position}
      fontSize={fontSize}
      color="#ffffff"
      anchorX="center"
      anchorY="middle"
      font="/fonts/Geist-Bold.ttf"
    >
      {text}
    </Text>
  )
}

function Scene() {
  return (
    <>
      <Background />
      <AnimatedText text="PulseNode" position={[0, 1, 0]} fontSize={0.8} />
      <AnimatedText text="Game Hosting" position={[0, 0, 0]} fontSize={0.4} />
      <Environment preset="city" />
    </>
  )
}

export default function PulseNodeInteractive() {
  const [messages, setMessages] = useState<string[]>([])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [currentWord, setCurrentWord] = useState(0)
  const words = ["Minecraft", "Valheim", "Terraria", "ARK"]
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })

  const sections = ['home', 'features', 'pricing', 'console']

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      if (i < STARTUP_MESSAGES.length) {
        setMessages(prev => [...prev, STARTUP_MESSAGES[i]])
        i++
      } else {
        clearInterval(interval)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const windowHeight = window.innerHeight
      const newSection = Math.floor(scrollPosition / windowHeight)
      setCurrentSection(newSection)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() === "") return

    setMessages(prev => [...prev, `> ${input}`])

    const command = input.toLowerCase()
    
    switch(command) {
      case "help":
      case "?":
        setMessages(prev => [...prev, "Available commands:", ...AVAILABLE_COMMANDS])
        break
      case "/status":
        setMessages(prev => [...prev, "All systems operational. Current server load: 42%"])
        break
      case "/plans":
        setMessages(prev => [...prev, "Available plans:", ...plans.map(plan => `${plan.name}: ${plan.ram} RAM, ${plan.cpu}, ${plan.storage} - $${plan.price}/mo`)])
        break
      case "/uptime":
        setMessages(prev => [...prev, "Current uptime: 99.99% over the last 30 days"])
        break
      case "/specs":
        setMessages(prev => [...prev, "Our servers use the latest AMD EPYC processors and NVMe SSDs for optimal performance"])
        break
      case "/support":
        setMessages(prev => [...prev, "For support, please email support@pulsenode.net or use our 24/7 live chat on the website"])
        break
      case "/discord":
        setMessages(prev => [...prev, "Join our Discord community: https://discord.gg/pulsenode"])
        break
      case "/tutorials":
        setMessages(prev => [...prev, "Check out our video tutorials at https://pulsenode.net/tutorials"])
        break
      case "/social":
        setMessages(prev => [...prev, "Follow us on Twitter: @PulseNode, Instagram: @PulseNodeHosting"])
        break
      default:
        setMessages(prev => [...prev, "Unknown command. Type '/help' or '?' to see available commands."])
    }

    setInput("")
  }

  const scrollToSection = (index: number) => {
    const element = document.getElementById(sections[index])
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleGetStarted = () => {
    toast({
      title: "Welcome to PulseNode!",
      description: "You're on your way to high-performance game hosting.",
    })
  }

  const handleSelectPlan = (planName: string) => {
    toast({
      title: `${planName} Plan Selected`,
      description: `You've chosen the ${planName} plan. Great choice!`,
    })
  }

  return (
    <div className="bg-black text-white overflow-hidden">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${cursorPosition.x}px ${cursorPosition.y}px, rgba(255,65,54,0.2) 0%, rgba(0,0,0,0) 50%)`,
          transition: 'background 0.3s ease',
        }}
      />

      <nav className="fixed top-0 left-0 w-16 h-screen flex flex-col justify-center items-center z-50">
        {sections.map((section, index) => (
          <button
            key={section}
            onClick={() => scrollToSection(index)}
            className={`w-3 h-3 my-2 rounded-full ${currentSection === index ? 'bg-red-500' : 'bg-gray-500'}`}
            aria-label={`Scroll to ${section}`}
          />
        ))}
      </nav>

      <section id="home" className="h-screen flex items-center justify-center relative overflow-hidden">
        <Canvas className="absolute inset-0">
          <Suspense fallback={null}>
            <Scene />
            <OrbitControls enableZoom={false} enablePan={false} />
          </Suspense>
        </Canvas>
        <div className="z-10 text-center">
          <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-blue-500">PulseNode</h1>
          <p className="text-2xl mb-8">Game Server Hosting for {words[currentWord]}</p>
          <Button size="lg" className="bg-gradient-to-r from-red-600 to-blue-600 text-white hover:from-red-700 hover:to-blue-700 transition-all duration-300" onClick={handleGetStarted}>
            Get Started
          </Button>
        </div>
        <ChevronDown 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer" 
          size={32} 
          onClick={() => scrollToSection(1)}
        />
      </section>

      <section id="features" className="min-h-screen flex items-center justify-center bg-black">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-blue-500">Why Choose PulseNode?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gray-900 border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <feature.icon className="w-12 h-12 mb-4 text-red-500" />
                  <CardTitle className="text-red-400">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="min-h-screen flex items-center justify-center bg-black">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-blue-500">Our Plans</h2>
          <Tabs defaultValue="monthly" className="w-full" onValueChange={(value) => setBillingCycle(value as "monthly" | "yearly")}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="monthly" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-blue-600 data-[state=active]:text-white transition-all duration-300">Monthly</TabsTrigger>
              <TabsTrigger value="yearly" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-blue-600 data-[state=active]:text-white transition-all duration-300">Yearly (Save 20%)</TabsTrigger>
            </TabsList>
            <TabsContent value="monthly">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan, index) => (
                  <Card key={index} className="bg-gray-900 border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-blue-500">{plan.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-gray-300">
                        <li>{plan.ram} RAM</li>
                        <li>{plan.cpu}</li>
                        <li>{plan.storage}</li>
                      </ul>
                    </CardContent>
                    <CardFooter className="flex flex-col">
                      <p className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-blue-500">${plan.price}/mo</p>
                      <Button className="w-full bg-gradient-to-r from-red-600 to-blue-600 text-white hover:from-red-700 hover:to-blue-700 transition-all duration-300" onClick={() => handleSelectPlan(plan.name)}>Select Plan</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="yearly">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan, index) => {
                  const yearlyPrice = plan.price * 12 * 0.8
                  return (
                    <Card key={index} className="bg-gray-900 border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <CardHeader>
                        <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-blue-500">{plan.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-gray-300">
                          <li>{plan.ram} RAM</li>
                          <li>{plan.cpu}</li>
                          <li>{plan.storage}</li>
                        </ul>
                      </CardContent>
                      <CardFooter className="flex flex-col">
                        <p className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-blue-500">${yearlyPrice.toFixed(2)}/year</p>
                        <Button className="w-full bg-gradient-to-r from-red-600 to-blue-600 text-white hover:from-red-700 hover:to-blue-700 transition-all duration-300" onClick={() => handleSelectPlan(plan.name)}>Select Plan</Button>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section id="console" className="min-h-screen flex items-center justify-center bg-black">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-blue-500">Try Our Console</h2>
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-900 p-4 rounded-lg h-[40vh] overflow-y-auto mb-4 text-red-400 font-mono border border-red-500 shadow-lg">
              {messages.map((message, index) => (
                <div key={index} className="mb-1">
                  {message}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-grow bg-gray-800 text-white border-red-500 focus:ring-red-500 placeholder-gray-400"
                placeholder="Type a command..."
              />
              <Button type="submit" className="bg-gradient-to-r from-red-600 to-blue-600 text-white hover:from-red-700 hover:to-blue-700 transition-all duration-300">
                Send
              </Button>
            </form>
          </div>
        </div>
      </section>

      <footer className="bg-black py-8 border-t border-gray-800">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2024 PulseNode. All rights reserved.</p>
        </div>
      </footer>

      <button
        onClick={() => scrollToSection(0)}
        className="fixed bottom-4 right-4 bg-gradient-to-r from-red-600 to-blue-600 text-white p-2 rounded-full shadow-lg hover:from-red-700 hover:to-blue-700 transition-all duration-300"
        aria-label="Scroll to top"
      >
        <ChevronUp className="w-6 h-6" />
      </button>
    </div>
  )
}
