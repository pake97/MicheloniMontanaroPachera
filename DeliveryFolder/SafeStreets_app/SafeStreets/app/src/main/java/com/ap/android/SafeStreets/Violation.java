/**
 * Violation.java
 * The class includes all the logic to create and handle a violation.
 **/
package com.ap.android.SafeStreets;

import android.location.Location;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import com.google.firebase.firestore.GeoPoint;


public class Violation {

	private String type;
	private String address;
	private Location location;
	private String picture1;
	private String picture2;
	private String picture3;
	private String picture4;
	private String picture5;
	private String licensePlate;
	private String licPlate;

	public static final int MIN_NUM_PICTURES = 1; //The minimum amount of pictures required to report a violation
	public static final int MAX_NUM_PICTURES = 5; //The maximum amount of pictures of a violation

	/**
	 *
	 * @param type: violation type
	 * @param address: address of the violation
	 * @param location: coordinates of the violation (latitude and longitude)
	 * @param licPlate: alphanumeric string containing the license plate
	 * @param licensePlate: contains the reference to the license plate picture
	 * @param pictures: contains all the reference to the violation pictures
	 */
	public Violation(String type, String address, Location location, String licPlate, String licensePlate, String[] pictures) {

		super();

		this.type = type;
		this.address = address;
		this.location = location;
		this.licPlate = licPlate;

		//assigning violation pictures and license plate picture
		this.addPicture(pictures);
		this.setLicensePlate(licensePlate);
	}

	/**
	 *Custom Constructor without all the pictures references
	 */
	public Violation(String type, String address, Location location) {

		super();

		this.type = type;
		this.address = address;
		this.location = location;

	}

	/**
	 *
	 * @return: a map containing all the violation data.
	 */
	public Map<String, Object> getMap (){
		Map<String, Object> violation = new HashMap<>();
		violation.put("address", this.address);
		violation.put("date", new Date());
		violation.put("img1",this.picture1);
		violation.put("img2",this.picture2);
		violation.put("img3",this.picture3);
		violation.put("img4",this.picture4);
		violation.put("img5",this.picture5);
		violation.put("imgT",this.licensePlate);
		violation.put("plate",this.licPlate);
		violation.put("validated",false);
		violation.put("position", new GeoPoint(this.location.getLatitude(), this.location.getLongitude()));
		violation.put("type",this.type);
		return violation;
	}


	/**
	 *
	 * @param pictures: array containing all the pictures references
	 *
	 * addPicture adds to the violation's fields (picture1, picture2, picture3, picture4 and picture5) all the
	 * pictures reference contained in the array of pictures passed as parameter.
	 * It checks also that the number of pics is correct.
	 */
	public void addPicture(String[] pictures) {

		//assigning violation pictures
		if(pictures != null) {

			int numPics = pictures.length;

			if(numPics >= MIN_NUM_PICTURES && numPics <= MAX_NUM_PICTURES) {

				int pos = numPics - 1;

				//assigning pictures to the variables
				switch(numPics) {

					case 5:

						this.picture5 = pictures[pos];
						--pos;

					case 4:

						this.picture4 = pictures[pos];
						--pos;

					case 3:

						this.picture3 = pictures[pos];
						--pos;

					case 2:

						this.picture2 = pictures[pos];
						--pos;

					case 1:

						this.picture1 = pictures[pos];

					default:
						break;
				}


			}

		}

	}





	public String getType() {
		return type;
	}


	public void setType(String type) {

		this.type = type;
	}


	public String getAddress() {

		return address;
	}


	public void setAddress(String address) {

		this.address = address;
	}


	public Location getLocation() {

		return location;
	}


	public void setLocation(Location location) {
		this.location = location;
	}

	/**
	 *
	 * @param pictureID: index of the requested picture
	 * @return: The string reference of the specified pictureID
	 */
	public String getPicture(int pictureID) {

		String ret = null;

		if(pictureID >= MIN_NUM_PICTURES && pictureID <= MAX_NUM_PICTURES) {

			switch(pictureID) {

				case 1:

					ret = this.picture1;
					break;

				case 2:

					ret = this.picture2;
					break;

				case 3:

					ret = this.picture3;
					break;

				case 4:

					ret = this.picture4;
					break;

				case 5:

					ret = this.picture5;
					break;

				default:
					break;
			}

		}

		return ret;
	}


	public String getLicensePlate() {

		return licensePlate;
	}


	public void setLicensePlate(String licensePlate) {

		this.licensePlate = licensePlate;
	}




	public String getLicPlate() {
		return licPlate;
	}




	@Override
	public String toString() {
		return "Violation [type=" + type + ", address=" + address + ", location=" + location + ", picture1=" + picture1
				+ ", picture2=" + picture2 + ", picture3=" + picture3 + ", picture4=" + picture4 + ", picture5="
				+ picture5 + ", licPlate=" + licPlate + ", licensePlate=" + licensePlate + "]";
	}




}
