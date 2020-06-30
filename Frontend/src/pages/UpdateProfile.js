import React, { useState, useEffect } from 'react';
import './LoginPage.css';
import { Container, Typography, Button } from "@material-ui/core";
import {Alert} from "@material-ui/lab";
import {Redirect} from "react-router-dom";
import TextInput from "../components/TextInput";
import axios from "axios";
import Loading from "./Loading";


function UpdateProfile(props) {
	const [name, setName] = useState("");
	const [nameError, setNameError] = useState(false);
	const [phoneNumber, setPhoneNumber] = useState("");
	const [numberError, setNumberError] = useState(false);

	const [loading, setLoading] = useState(true);
	const [type, setType] = useState(props.match.params.type);

	const [redirect, setRedirect] = useState(false);
	const [error, setError] = useState(false);

	const handleNameChange = (event) => {
		setName(event.target.value);
	}

	const handlePhoneNumberChange = (event) => {
		setPhoneNumber(event.target.value);
	}
	

	const keyPress = (event) => {
		if (event.key === "Enter") {
			handleSubmit();
		}
	}

	const handleSubmit = async () => {
		setLoading(true);
		let token = localStorage.getItem("authToken");
		let url = `https://quizzie-api.herokuapp.com/${type}/updateProfile`;

		if(name.trim().length === 0) {
			setNameError(true);
			setLoading(false);
			return;
		} else setNameError(false);

		if(phoneNumber.trim().length !== 10) {
			console.log(phoneNumber.length);
			setNumberError(true);
			setLoading(false);
			return;
		} else setNumberError(false);

		let data = [
			{"propName": "name", "value": name},
			{"propName": "mobileNumber", "value": phoneNumber}
		]

		try {
			await axios.patch(url, data, {
				headers: {
					"auth-token": token
				}
			}).then(res => {
				localStorage.setItem("name", name);
				setRedirect(true);
				window.location.reload(true);
			})
		} catch(error) {
			console.log(error);
			setError(true);
			setLoading(false);
		}
	}

	const getDetails = async () => {
		let token = localStorage.getItem("authToken");
		let url = `https://quizzie-api.herokuapp.com/${type}`;

		try {
			await axios.get(url, {
				headers: {
					"auth-token": token
				}
			}).then(res => {
				setName(res.data.result1.name);
				setPhoneNumber(res.data.result1.mobileNumber.toString());
				setLoading(false);
			})
		} catch(error) {
			console.log(error);
			setRedirect(true);
		}
	}

	useEffect(() => {
		getDetails();
	}, [])

	if(redirect) {
		return (
			<Redirect to="/dashboard" />
		)
	} 
	return (
		loading? <Loading />
		:
		<Container className="login-page">
			<div className="login-form">
				<Typography variant="h3" color="primary" className="login-head">Update Profile</Typography><br />
				{error === true? <Alert severity="error">There was some error! Please try again...</Alert>: null}
				<form className="form">
					<TextInput
						error={nameError}
						helperText={nameError? "Name cannot be empty": null}
						id="name"
						label="Name"
						type="text"
						className="form-input"
						variant="outlined"
						value={name}
						onChange={handleNameChange}
						onKeyPress={keyPress}></TextInput>
					<br />
					<TextInput
						error={numberError}
						helperText={numberError? "Invalid Phone Number": null}
						id="phone-number"
						type="text"
						label="Phone Number"
						className="form-input"
						variant="outlined"
						value={phoneNumber}
						onChange={handlePhoneNumberChange}
						onKeyPress={keyPress}></TextInput>
				</form>
				<Button className="login-btn" onClick={handleSubmit}>Update</Button>
			</div>
		</Container>
	)
}

export default UpdateProfile;