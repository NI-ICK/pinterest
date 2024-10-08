import { useContext, createContext, useState, useEffect } from "react"
import axios from "axios"
import { useUserContext } from "./UserContext"

const PinContext = createContext()

export function usePinContext() {
  return useContext(PinContext)
}

export function PinContextProvider({ children }) {
  const [pins, setPins] = useState([])
  const [pin, setPin] = useState(null)
  const { currUser, isMobile } = useUserContext()
  const [createdPins, setCreatedPins] = useState([])
  const [searchedPins, setSearchedPins] = useState([])
  const [comments, setComments] = useState([])
  const [similarPins, setSimilarPins] = useState([])
  const [pinModal, setPinModal] = useState(false)

  const fetchPins = async () => {
    try {
      const response = await axios.get(`/pins`)
      setPins(response.data)
    } catch(error) {
      console.log('Error fetching pins: ', error)
    }
  }

  const fetchPin = async (id) => {
    try {
      const response = await axios.get(`/pin/${id}`)
      setPin(response.data)
      if(!response.data) return false
      return true
    } catch(error) {
      console.log('Error fetching pins: ', error)
    }
  }

  const fetchPinComments = async (id) => {
    try {
      const response = await axios.get(`/pin/${id}/comments`)
      setComments(response.data.comments)
    } catch(error) {
      console.log('Error fetching comments: ', error)
    }
  }

  const fetchCreatedPins = async (id) => {
    try {
      const response = await axios.get(`/pins/created`, { params: { id }})
      setCreatedPins(response.data)
    } catch(error) {
      console.log('Error fetching created pins', error)
    }
  }

  const fetchSearchedPins = async (query) => {
    try {
      const response = await axios.get(`/pins/search/`, { params: { query }})
      setSearchedPins(response.data)
    } catch(error) {
      console.log('Error fetching searched pins', error)
    }
  }

  const fetchSimilarPins = async (id) => {
    try {
      const response = await axios.get(`/pins/similar/`, { params: { id }})
      setSimilarPins(response.data)
    } catch(error) {
      console.log('Error fetching similar pins', error)
    }
  }

  const adjustGridRows = (pin, width, height) => {
    const calcHeight = pin.offsetWidth * (height / width)

    const title = pin.querySelector('.pinTitle')
    const placeholder = pin.querySelector('.imgPlaceholder')

    const pinHeight = calcHeight + title.clientHeight + 15
    const rowSpan = Math.ceil(pinHeight / 10) + 1
    placeholder.style.height = `${calcHeight}px`
    pin.style.height = `${pinHeight}px`
    pin.style.gridRowEnd = `span ${rowSpan}`
  }  
  
  const handleDeletePin = async (id) => {
    try {
      await axios.delete(`/pin/delete/${id}`)
      fetchPins()
    } catch(error) {
      console.log('Error deleting pin:', error)
    } 
  }
  
  const handleLikes = async (id, action) => {
    try {
      await axios.put(`/likes`, { id, action, currUser })
    } catch(error) {
      console.log("Error: ", error)
    }
  }

  const handleDeleteCommentOrReply = async (id, pinId, commId) => {
    try {
        await axios.delete(`/comment/delete/${id}`, { params: { pinId, commId }})
        await fetchPinComments(pinId)
      } catch(error) {
        console.log("Error: ", error)
      }
  }

  return (
    <PinContext.Provider value={{ 
      fetchPins, 
      pins, 
      fetchPin, 
      pin, 
      setPin,  
      handleDeletePin, 
      handleLikes,
      fetchPinComments,
      fetchCreatedPins,
      createdPins,
      adjustGridRows,
      searchedPins,
      fetchSearchedPins,
      setSearchedPins,
      comments,
      setComments,
      similarPins,
      fetchSimilarPins,
      setPinModal,
      pinModal,
      handleDeleteCommentOrReply
      }}>
      {children}
    </PinContext.Provider>
  )
}