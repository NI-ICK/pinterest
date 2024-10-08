import { useContext, createContext, useState, useEffect } from "react"
import { useUserContext } from "./UserContext"
import { usePinContext } from "./PinContext"
import axios from "axios"
import { useLocation } from 'react-router-dom'
import { useCollectionContext } from './CollectionContext'

const FormDataContext = createContext()
  
export function useFormDataContext() {
  return useContext(FormDataContext)
}

export function FormDataContextProvider({ children }) {
  const { currUser, setCurrUser, fetchUsers, fetchCurrUser } = useUserContext()
  const initialFormData = {
    createPin: {
      title:  null,
      description:  null,
      image: null,
      tags: null,
      user:  null,
    },
    editPin: {
        title: null,
        description: null,
        tags: null
    },
    register: {
      username:  null,
      password:  null,
      email:  null
    },
    login: {
      email:  null,
      password:  null,
    },
    edit: {
      username:  null,
      password:  null,
      email:  null,
      photo: null,
      firstName:  null,
      lastName:  null,
      about:  null,
      user:  null
    },
    comment: {
      content:  null,
      user:  null,
      parentId:  null,
    },
    collection: {
      name: null,
      user: null,
      pin: null
    }
  }
  const [formData, setFormData] = useState(initialFormData)
  const { fetchPins } = usePinContext()
  const [formFilled, setFormFilled] = useState(false)
  const location = useLocation()
  const [showPopup, setShowPopup] = useState(false)
  const [popupText, setPopupText] = useState('')
  const [areCollecitonsFetched, setAreCollectionsFetched] = useState(false)
  const { fetchUserCollections, collections, setSelectedCollection } = useCollectionContext()
  const [isUserFetched, setIsUserFetched] = useState(false)

  useEffect(() => {
    const editFormFilled = Object.values(formData.edit).some(value => !!value)
    const commentFormFilled = !!formData.comment.content

    setFormFilled(editFormFilled || commentFormFilled)
  }, [formData.comment, formData.edit])

  useEffect(() => {
    resetFormData()
    setFormFilled(false)
  }, [location])
  
  const resetFormData = () => {
    setFormData(initialFormData)
  }

  // Create Pin Form

  const handleCreatePinChange = (e) => {
    const { name, value, files } = e.target
    if(name === 'image') {
      setFormData(prevFormData => ({ ...prevFormData, createPin: { ...prevFormData.createPin, image: files[0] }}))
    } else {
      setFormData(prevFormData => ({ ...prevFormData, createPin: { ...prevFormData.createPin, [name]: value }}))
    }  
  }

  const handleCreatePinSubmit = async () => {
    const updatedFormData = { ...formData.createPin, user: currUser }
    try {
      await axios.post(`/createPin`, updatedFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    } catch (error) {
      console.error('Error creating pin:', error);
    }
    fetchPins()
    resetFormData()
  }

  // Edit Pin Form

  const handleEditPinChange = (e) => {
    const { name, value } = e.target
      setFormData(prevFormData => ({ ...prevFormData, editPin: { ...prevFormData.editPin, [name]: value }}))
 
  }

  const handleEditPinSubmit = async (id) => {
    try {
      await axios.put(`/editPin/${id}`, formData.editPin)
    } catch (error) {
      console.error('Error editing pin:', error)
    }
    fetchPins()
    resetFormData()
  }

  // Register Form

  const handleRegisterChange = (e) => {
    const { name, value } = e.target
    setFormData(prevFormData => ({ ...prevFormData, register: { ...prevFormData.register, [name]: value }}))
  }

  const handleRegisterSubmit = async () => {
    try {
      await axios.post(`/register`, formData.register, {
        headers: { 'Content-Type': 'application/json' }
      })
      setPopupText('Account Created')
      setShowPopup(true)
      setTimeout(() => {
        setShowPopup(false)
      }, 3000)
    } catch (error) {
      setPopupText(error.response.data.message)
      setShowPopup(true)
      setTimeout(() => {
        setShowPopup(false)
      }, 3000)
      console.error('Error registering:', error);
    }
    resetFormData()
  }

  // Login Form

  const handleLoginChange = (e) => {
    const { name, value } = e.target
    setFormData(prevFormData => ({ ...prevFormData, login: { ...prevFormData.login, [name]: value }}))
  }

  const handleLoginSubmit = async () => {
    try {
      const response = await axios.post(`/login`, formData.login, { 
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      })
      localStorage.setItem('token', response.data.token)
      setCurrUser(response.data.user)
      setIsUserFetched(true)
    } catch (error) {
      setPopupText(error.response.data.message)
      setShowPopup(true)
      setTimeout(() => {
        setShowPopup(false)
      }, 3000)
      console.error('Error Loging in:', error);
    }
    resetFormData()
  }

  const loadData = async () => {
    if(isUserFetched) {
      await fetchUserCollections(currUser._id)
      setAreCollectionsFetched(true)  
    }
  }

  useEffect(() => {
    loadData()
  }, [isUserFetched])

  useEffect(() => {
    setSelectedCollection(collections[0])
  }, [areCollecitonsFetched])

  // Edit User Form

  const handleEditUserChange = (e) => {
    const { name, value, files } = e.target
    if(name === 'photo') {
      setFormData(prevFormData => ({ ...prevFormData, edit: { ...prevFormData.edit, photo: files[0] }}))
    } else {
      setFormData(prevFormData => ({ ...prevFormData, edit: { ...prevFormData.edit, [name]: value }}))
    }
  }

  const handleEditUserSubmit = async () => {
    const updatedFormData = { ...formData.edit, user: currUser._id }
    try {
      await axios.put(`/editUser`, updatedFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    } catch (error) {
      console.error('Error editing user:', error);
    }
    fetchUsers()
    fetchCurrUser()
    resetFormData()
  }

  // Comment Form

  const handleCommentChange = (e, id) => {
    const { name, value } = e.target
    setFormData(prevFormData => ({ ...prevFormData, comment: { ...prevFormData.comment, [name]: value }}))
    setFormData(prevFormData => ({ ...prevFormData, comment: { ...prevFormData.comment, parentId: id }}))
  }

  const handleCommentSubmit = async () => {
    const updatedFormData = { ...formData.comment, user: currUser }
    try {
      await axios.post(`/comment`, updatedFormData, {
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('Error adding comment:', error);
    }
    resetFormData()
  }

  // Collection Form 

  const handleCreateCollectionChange = (e) => {
    const { name, value } = e.target
    setFormData(prevFormData => ({ ...prevFormData, collection: { ...prevFormData.collection, [name]: value }}))
  }

  const handleCreateCollectionSubmit = async (id) => {
    const updatedFormData = { ...formData.collection, user: currUser._id, pin: id }
    try {
      await axios.post(`/collections/create`, updatedFormData)
    } catch(error) {
      console.log("Error creating collection: ", error)
    }
  }

  return (
    <FormDataContext.Provider value={{ 
      formData, 
      setFormData,
      handleCreatePinChange, 
      handleCreatePinSubmit, 
      handleRegisterChange, 
      handleRegisterSubmit, 
      handleLoginChange, 
      handleLoginSubmit,
      handleEditUserChange,
      handleEditUserSubmit,
      handleCommentChange,
      handleCommentSubmit,
      handleCreateCollectionChange,
      handleCreateCollectionSubmit,
      handleEditPinChange,
      handleEditPinSubmit,
      formFilled,
      showPopup,
      popupText,
      setPopupText,
      resetFormData
      }} >
      {children}
    </FormDataContext.Provider>
  )
}