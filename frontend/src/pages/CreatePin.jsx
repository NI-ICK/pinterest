import { useFormDataContext } from "../context/FormDataContext"
import { Dropzone } from "../components/Dropzone"
import { useNavigate } from "react-router-dom"

export function CreatePin() {
  const { formData, handleCreatePinChange, handleCreatePinSubmit } = useFormDataContext()
  const navigate = useNavigate()

  const formSubmit = (e) => {
    e.preventDefault()
    handleCreatePinSubmit()
    navigate('/')
    const form = e.target
    form.reset()
  }

  return (  
    <>  
      <form onSubmit={formSubmit} className="fInput">
        <div className="formHeader">
          <h2>Create Pin</h2>
          <button type="submit" className="redBtn">Publish</button>
        </div>
        <div className="formInputs">
          <Dropzone />
          <div className="textInputs">
            <div>
              <label htmlFor="title">Title</label>
              <input type="text" name="title" id="title" placeholder="Add title" value={formData.title} onChange={handleCreatePinChange} />
            </div>
            <div>
              <label htmlFor="description">Description</label>
              <textarea type="text" name="description" id="description" placeholder="Add description" value={formData.description} onChange={handleCreatePinChange} />
            </div>
          </div>
        </div>
      </form>
    </>
  )
}