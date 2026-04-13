import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{
      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      backgroundColor: "#0a0a0f",
      color: "#ffffff",
      minHeight: "100vh",
      overflow: "hidden"
    }}>
      {/* Animated Background */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "radial-gradient(circle at 20% 50%, rgba(88, 28, 135, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)",
        zIndex: 0
      }} />

      {/* Floating Orbs Animation */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        zIndex: 0
      }}>
        <div style={{
          position: "absolute",
          top: "10%",
          left: "10%",
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)",
          borderRadius: "50%",
          animation: "float 20s ease-in-out infinite",
          filter: "blur(40px)"
        }} />
        <div style={{
          position: "absolute",
          bottom: "10%",
          right: "10%",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)",
          borderRadius: "50%",
          animation: "float 15s ease-in-out infinite reverse",
          filter: "blur(40px)"
        }} />
      </div>

      {/* Header */}
      <header style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        padding: "1.5rem 5%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 1000,
        backgroundColor: scrolled ? "rgba(10, 10, 15, 0.8)" : "transparent",
        backdropFilter: scrolled ? "blur(10px)" : "none",
        transition: "all 0.3s ease",
        borderBottom: scrolled ? "1px solid rgba(255, 255, 255, 0.1)" : "none"
      }}>
        <div style={{
          fontSize: "1.5rem",
          fontWeight: "800",
          background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "-0.02em"
        }}>
          InternHub
        </div>
        <nav style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          <a href="#features" style={{ color: "#a1a1aa", textDecoration: "none", fontSize: "0.95rem", fontWeight: "500", transition: "color 0.2s" }} onMouseEnter={(e) => e.target.style.color = "#ffffff"} onMouseLeave={(e) => e.target.style.color = "#a1a1aa"}>Features</a>
          <a href="#how-it-works" style={{ color: "#a1a1aa", textDecoration: "none", fontSize: "0.95rem", fontWeight: "500", transition: "color 0.2s" }} onMouseEnter={(e) => e.target.style.color = "#ffffff"} onMouseLeave={(e) => e.target.style.color = "#a1a1aa"}>How It Works</a>
          <a href="#benefits" style={{ color: "#a1a1aa", textDecoration: "none", fontSize: "0.95rem", fontWeight: "500", transition: "color 0.2s" }} onMouseEnter={(e) => e.target.style.color = "#ffffff"} onMouseLeave={(e) => e.target.style.color = "#a1a1aa"}>Benefits</a>
          <button
            onClick={() => navigate("/login")}
            style={{
              padding: "0.65rem 1.5rem",
              backgroundColor: "transparent",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "0.95rem",
              fontWeight: "600",
              transition: "all 0.2s",
              marginLeft: "1rem"
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
              e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
            }}
          >
            Sign In
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{
        position: "relative",
        zIndex: 1,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 5%",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: "900px", animation: "fadeInUp 1s ease-out" }}>
          <div style={{
            display: "inline-block",
            padding: "0.5rem 1rem",
            backgroundColor: "rgba(139, 92, 246, 0.1)",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            borderRadius: "50px",
            fontSize: "0.85rem",
            fontWeight: "600",
            color: "#a78bfa",
            marginBottom: "2rem",
            letterSpacing: "0.05em"
          }}>
            🚀 THE FUTURE OF INTERNSHIP MANAGEMENT
          </div>
          
          <h1 style={{
            fontSize: "clamp(2.5rem, 7vw, 5rem)",
            fontWeight: "800",
            lineHeight: "1.1",
            marginBottom: "1.5rem",
            letterSpacing: "-0.02em",
            background: "linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Connect Students with<br />
            <span style={{
              background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              Dream Internships
            </span>
          </h1>
          
          <p style={{
            fontSize: "1.25rem",
            color: "#a1a1aa",
            marginBottom: "3rem",
            lineHeight: "1.7",
            maxWidth: "700px",
            margin: "0 auto 3rem"
          }}>
            Streamline your internship process with AI-powered matching, automated scheduling, and comprehensive verification. Built for universities, companies, and students.
          </p>
          
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/register")}
              style={{
                padding: "1rem 2.5rem",
                background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "1.1rem",
                fontWeight: "700",
                boxShadow: "0 10px 40px rgba(139, 92, 246, 0.3)",
                transition: "all 0.3s",
                position: "relative",
                overflow: "hidden"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 15px 50px rgba(139, 92, 246, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 10px 40px rgba(139, 92, 246, 0.3)";
              }}
            >
              Get Started Free
            </button>
            
            <button
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              style={{
                padding: "1rem 2.5rem",
                backgroundColor: "transparent",
                color: "#ffffff",
                border: "2px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "1.1rem",
                fontWeight: "700",
                transition: "all 0.3s"
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
              }}
            >
              Learn More
            </button>
          </div>

          {/* Stats */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "2rem",
            marginTop: "5rem",
            maxWidth: "600px",
            margin: "5rem auto 0"
          }}>
            {[
              { number: "10K+", label: "Students" },
              { number: "500+", label: "Companies" },
              { number: "95%", label: "Success Rate" }
            ].map((stat, i) => (
              <div key={i} style={{
                textAlign: "center",
                animation: `fadeInUp 1s ease-out ${0.2 + i * 0.1}s backwards`
              }}>
                <div style={{
                  fontSize: "2.5rem",
                  fontWeight: "800",
                  background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginBottom: "0.5rem"
                }}>
                  {stat.number}
                </div>
                <div style={{ color: "#71717a", fontSize: "0.95rem" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        position: "relative",
        zIndex: 1,
        padding: "8rem 5%",
        backgroundColor: "rgba(255, 255, 255, 0.02)"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "5rem" }}>
            <h2 style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: "800",
              marginBottom: "1rem",
              letterSpacing: "-0.02em"
            }}>
              Everything You Need
            </h2>
            <p style={{ color: "#a1a1aa", fontSize: "1.2rem", maxWidth: "600px", margin: "0 auto" }}>
              Powerful features designed to make internship management seamless and efficient
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem"
          }}>
            {[
              {
                icon: "🎯",
                title: "Smart Matching",
                desc: "AI-powered algorithm matches students with perfect internship opportunities based on skills, interests, and requirements"
              },
              {
                icon: "📅",
                title: "Interview Scheduling",
                desc: "Automated calendar integration with Zoom, Google Meet. One-click scheduling with email reminders"
              },
              {
                icon: "✅",
                title: "Verification System",
                desc: "Comprehensive company verification, document management, and compliance tracking for trust and security"
              },
              {
                icon: "📊",
                title: "Analytics Dashboard",
                desc: "Real-time insights, application tracking, success metrics, and performance analytics for data-driven decisions"
              },
              {
                icon: "💬",
                title: "Real-time Chat",
                desc: "Direct messaging between students and companies. File sharing, interview coordination, and instant communication"
              },
              {
                icon: "⭐",
                title: "Rating & Reviews",
                desc: "Transparent feedback system. Students rate companies, companies rate students. Build trust through transparency"
              }
            ].map((feature, i) => (
              <div
                key={i}
                style={{
                  padding: "2.5rem",
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "20px",
                  transition: "all 0.3s",
                  cursor: "pointer",
                  animation: `fadeInUp 0.8s ease-out ${0.1 * i}s backwards`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                  e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.3)";
                  e.currentTarget.style.transform = "translateY(-5px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.03)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>{feature.icon}</div>
                <h3 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem" }}>
                  {feature.title}
                </h3>
                <p style={{ color: "#a1a1aa", lineHeight: "1.6" }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{
        position: "relative",
        zIndex: 1,
        padding: "8rem 5%"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "5rem" }}>
            <h2 style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: "800",
              marginBottom: "1rem",
              letterSpacing: "-0.02em"
            }}>
              How It Works
            </h2>
            <p style={{ color: "#a1a1aa", fontSize: "1.2rem" }}>
              Get started in 3 simple steps
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "3rem",
            position: "relative"
          }}>
            {[
              {
                step: "01",
                title: "Create Account",
                desc: "Sign up as a student, company, or admin. Complete your profile with relevant information"
              },
              {
                step: "02",
                title: "Post or Apply",
                desc: "Companies post internships, students browse and apply. Smart matching suggests best fits"
              },
              {
                step: "03",
                title: "Connect & Grow",
                desc: "Schedule interviews, track progress, provide feedback, and build professional relationships"
              }
            ].map((step, i) => (
              <div key={i} style={{ textAlign: "center", animation: `fadeInUp 0.8s ease-out ${0.2 * i}s backwards` }}>
                <div style={{
                  width: "80px",
                  height: "80px",
                  margin: "0 auto 2rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)",
                  border: "2px solid rgba(139, 92, 246, 0.3)",
                  borderRadius: "50%",
                  fontSize: "1.5rem",
                  fontWeight: "800",
                  color: "#8b5cf6"
                }}>
                  {step.step}
                </div>
                <h3 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem" }}>
                  {step.title}
                </h3>
                <p style={{ color: "#a1a1aa", lineHeight: "1.6" }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" style={{
        position: "relative",
        zIndex: 1,
        padding: "8rem 5%",
        backgroundColor: "rgba(255, 255, 255, 0.02)"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "4rem",
            alignItems: "center"
          }}>
            <div>
              <h2 style={{
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontWeight: "800",
                marginBottom: "2rem",
                letterSpacing: "-0.02em"
              }}>
                Why Choose InternHub?
              </h2>
              
              {[
                { icon: "⚡", title: "Lightning Fast", desc: "Process applications 10x faster with automation" },
                { icon: "🔒", title: "Secure & Verified", desc: "Complete company verification and data protection" },
                { icon: "🎨", title: "Intuitive Design", desc: "Beautiful, easy-to-use interface for everyone" },
                { icon: "📱", title: "Mobile Friendly", desc: "Access from anywhere on any device" }
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex",
                  gap: "1.5rem",
                  marginBottom: "2rem",
                  animation: `fadeInUp 0.8s ease-out ${0.2 * i}s backwards`
                }}>
                  <div style={{
                    fontSize: "2rem",
                    minWidth: "60px",
                    height: "60px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(139, 92, 246, 0.1)",
                    borderRadius: "12px"
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.5rem" }}>
                      {item.title}
                    </h3>
                    <p style={{ color: "#a1a1aa" }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              padding: "3rem",
              background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)",
              border: "1px solid rgba(139, 92, 246, 0.2)",
              borderRadius: "24px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>🎓</div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem" }}>
                For Students
              </h3>
              <p style={{ color: "#a1a1aa", marginBottom: "2rem", lineHeight: "1.6" }}>
                Find your dream internship. Build your profile, discover opportunities, track applications, and kickstart your career.
              </p>
              <button
                onClick={() => navigate("/register")}
                style={{
                  padding: "0.75rem 2rem",
                  background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "600",
                  transition: "transform 0.2s"
                }}
                onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
                onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
              >
                Apply as Student
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        position: "relative",
        zIndex: 1,
        padding: "8rem 5%",
        textAlign: "center"
      }}>
        <div style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "4rem",
          background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)",
          border: "1px solid rgba(139, 92, 246, 0.2)",
          borderRadius: "24px"
        }}>
          <h2 style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: "800",
            marginBottom: "1.5rem",
            letterSpacing: "-0.02em"
          }}>
            Ready to Get Started?
          </h2>
          <p style={{
            color: "#a1a1aa",
            fontSize: "1.2rem",
            marginBottom: "2.5rem",
            lineHeight: "1.7"
          }}>
            Join thousands of students and companies already using InternHub to build successful internship partnerships
          </p>
          <button
            onClick={() => navigate("/register")}
            style={{
              padding: "1.2rem 3rem",
              background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "1.2rem",
              fontWeight: "700",
              boxShadow: "0 10px 40px rgba(139, 92, 246, 0.3)",
              transition: "all 0.3s"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 15px 50px rgba(139, 92, 246, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 10px 40px rgba(139, 92, 246, 0.3)";
            }}
          >
            Create Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        position: "relative",
        zIndex: 1,
        padding: "4rem 5%",
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        textAlign: "center",
        color: "#71717a"
      }}>
        <div style={{
          fontSize: "1.5rem",
          fontWeight: "800",
          background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: "1rem"
        }}>
          InternHub
        </div>
        <p style={{ marginBottom: "2rem" }}>
          Connecting talent with opportunity
        </p>
        <div style={{ display: "flex", gap: "2rem", justifyContent: "center", flexWrap: "wrap", fontSize: "0.9rem" }}>
<button type="button" style={{ color: "#71717a", textDecoration: "none", background: "none", border: "none", cursor: "default", fontFamily: "inherit", padding: 0 }}>Privacy Policy</button>
<button type="button" style={{ color: "#71717a", textDecoration: "none", background: "none", border: "none", cursor: "default", fontFamily: "inherit", padding: 0 }}>Terms of Service</button>
<button type="button" style={{ color: "#71717a", textDecoration: "none", background: "none", border: "none", cursor: "default", fontFamily: "inherit", padding: 0 }}>Contact Us</button>
        </div>
        <div style={{ marginTop: "2rem", fontSize: "0.85rem" }}>
          © 2024 InternHub. All rights reserved.
        </div>
      </footer>

      {/* CSS Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(50px, 50px);
          }
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;