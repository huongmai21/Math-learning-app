// "use client"

// import { useState, useEffect } from "react"
// import { Link } from "react-router-dom"
// import { FaCalendarAlt, FaUser, FaTag, FaSearch, FaFilter } from "react-icons/fa"
// import { getNews, getCategories } from "../../services/newsService"
// import Spinner from "../../components/ui/Spinner"
// import "./News.css"

// const NewsPage = () => {
//   const [news, setNews] = useState([])
//   const [categories, setCategories] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [selectedCategory, setSelectedCategory] = useState("all")
//   const [showFilters, setShowFilters] = useState(false)

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true)
//         const [newsData, categoriesData] = await Promise.all([getNews(), getCategories()])
//         setNews(newsData.data)
//         setCategories(categoriesData.data)
//       } catch (error) {
//         console.error("Error fetching news data:", error)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchData()
//   }, [])

//   const filteredNews = news.filter((item) => {
//     const matchesSearch =
//       item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.summary.toLowerCase().includes(searchTerm.toLowerCase())
//     const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
//     return matchesSearch && matchesCategory
//   })

//   const toggleFilters = () => {
//     setShowFilters(!showFilters)
//   }

//   if (loading) {
//     return (
//       <div className="news-loading">
//         <Spinner />
//       </div>
//     )
//   }

//   return (
//     <div className="news-page">
//       <div className="news-header">
//         <h1>Tin tức giáo dục</h1>
//         <p>Cập nhật những tin tức mới nhất về giáo dục và học tập</p>
//       </div>

//       <div className="news-search-container">
//         <div className="news-search">
//           <FaSearch className="search-icon" />
//           <input
//             type="text"
//             placeholder="Tìm kiếm tin tức..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>
//         <button className="filter-toggle" onClick={toggleFilters}>
//           <FaFilter /> Bộ lọc
//         </button>
//       </div>

//       {showFilters && (
//         <div className="news-filters">
//           <div className="category-filters">
//             <button className={selectedCategory === "all" ? "active" : ""} onClick={() => setSelectedCategory("all")}>
//               Tất cả
//             </button>
//             {categories.map((category) => (
//               <button
//                 key={category._id}
//                 className={selectedCategory === category.name ? "active" : ""}
//                 onClick={() => setSelectedCategory(category.name)}
//               >
//                 {category.name}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {filteredNews.length === 0 ? (
//         <div className="no-news">
//           <p>Không tìm thấy tin tức phù hợp với tìm kiếm của bạn.</p>
//         </div>
//       ) : (
//         <div className="news-grid">
//           {filteredNews.map((item) => (
//             <div className="news-card" key={item._id}>
//               <div className="news-image">
//                 <img src={item.image || "/placeholder.svg?height=200&width=300"} alt={item.title} />
//                 <div className="news-category">{item.category}</div>
//               </div>
//               <div className="news-content">
//                 <h3>
//                   <Link to={`/news/${item._id}`}>{item.title}</Link>
//                 </h3>
//                 <p className="news-summary">{item.summary}</p>
//                 <div className="news-meta">
//                   <span>
//                     <FaCalendarAlt /> {new Date(item.createdAt).toLocaleDateString("vi-VN")}
//                   </span>
//                   <span>
//                     <FaUser /> {item.author}
//                   </span>
//                   <span>
//                     <FaTag /> {item.category}
//                   </span>
//                 </div>
//                 <Link to={`/news/${item._id}`} className="read-more">
//                   Đọc tiếp
//                 </Link>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

// export default NewsPage
