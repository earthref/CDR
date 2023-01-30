/* Instructions for updating:

    1) Go to https://docs.google.com/spreadsheets/d/1l6zLUyqeJ5eC6Qc2L0rJ7kLn7YVbijkU2R0p7JUvU74 and 
      copy the JSON cells (column P row 2 to the last entry in column R).
    2) Go to https://jsonlint.com/, paste the JSON into the text area, click "Validate JSON", and 
      copy the formatted JSON.
    3) Replace the JSON starting after "'tables': " roughly on line 17 and before the "};" at the end.
    4) Update the 'updated_day' field at the beginning.

*/

export const versions = ['1.0'];

export const model = {
	'updated_day': '2021:06:08',
	'published_day': '2021:03:18',
	'data_model_version': '1.0',
	'tables':{
	
	'contribution': {
		'label': 'Contribution',
		'position': 1,
		'description': 'Contribution metadata',
		'notes': 'Versioning, ownership, contribution status',
		'columns': {
			'id': {
				'label': 'Contribution ID',
				'group': 'Contribution',
				'position': 1,
				'type': 'Integer',
				'description': 'Unique CDR Contribution ID',
				'notes': 'Written during contribution activation',
				'examples': ['5412'],
				'validations': ['downloadOnly()']
			},
			'version': {
				'label': 'Version',
				'group': 'Contribution',
				'position': 2,
				'type': 'Integer',
				'description': 'Contribution version number',
				'notes': '1 for original contribution, 6 for latest contribution if there are 6 versions, empty if the contribution is not activated, written during contribution activation',
				'validations': ['downloadOnly()']
			},
			'timestamp': {
				'label': 'Activation Timestamp',
				'group': 'Contribution',
				'position': 3,
				'type': 'Timestamp',
				'description': 'Date and time of contribution activation',
				'notes': 'ISO 8601 date and time (e.g. "yyyy-mm-ddThh:mm:ss.sssZ"), written during contribution activation',
				'examples': ['2017', '2014-04-21', '1970-01-01T00:00:00', '1969-07-20T22:56:15-04:00'],
				'validations': ['downloadOnly()']
			},
			'contributor': {
				'label': 'Contributor',
				'group': 'Contribution',
				'position': 4,
				'type': 'String',
				'description': 'Contributor EarthRef handle',
				'notes': 'Written during contribution activation',
				'examples': ['@njarboe'],
				'validations': ['downloadOnly()']
			},
			'is_validated': {
				'label': 'Is Validated',
				'group': 'Contribution',
				'position': 5,
				'type': 'String',
				'unit': 'Flag',
				'description': 'Contribution has passed the CDR Data Model validation',
				'validations': ['cv("boolean")', 'downloadOnly()']
			},
			'is_reviewed': {
				'label': 'Is Reviewed',
				'group': 'Contribution',
				'position': 6,
				'type': 'String',
				'unit': 'Flag',
				'description': 'Contribution has been reviewed for correct usage of the CDR Data Model',
				'validations': ['cv("boolean")', 'downloadOnly()']
			},
			'data_model_version': {
				'label': 'Data Model Version',
				'group': 'Contribution',
				'position': 7,
				'type': 'String',
				'description': 'CDR data model version',
				'notes': 'Written during contribution activation',
				'examples': ['2.5', '3.0'],
				'validations': ['cv("data_model_version")', 'downloadOnly()']
			},
			'reference': {
				'label': 'Contribution Reference',
				'group': 'Contribution',
				'position': 8,
				'type': 'String',
				'description': 'The DOI or URL for the document describing this study',
				'notes': 'The DOI must resolve to a publisher or the URL to a web page',
				'examples': ['10.1029/92JB01202', '10.1023/A:1015035228810', 'https://my-university.edu/my_phd_thesis.pdf'],
				'validations': ['type("references")']
			},
			'author': {
				'label': 'Original Author',
				'group': 'Contribution',
				'position': 9,
				'type': 'String',
				'description': 'Original author EarthRef handle or name and email or ORCID',
				'examples': ['@cconstable', 'Not A. Member <no.earthref.handle@gmail.com>', '0000-0002-9000-2100'],
				'validations': ['type("users")']
			},
			'lab_names': {
				'label': 'Laboratory Names',
				'group': 'Contribution',
				'position': 10,
				'type': 'List',
				'description': 'List of labs (with institution and country) where the measurements in the contribution were made',
				'notes': 'European Labs use names from EPOS MLS',
				'examples': ['Paleomagnetic Laboratory Fort Hoofddijk (Utrecht University, The Netherlands)', 'Paleomagnetic Laboratory (INGV,  Italy)'],
				'validations': ['cv("lab_names")', 'required()']
			},
			'supplemental_links': {
				'label': 'Supplemental Data Links',
				'group': 'Contribution',
				'position': 11,
				'type': 'Dictionary',
				'description': 'Display name for the link and the permanent URL to the supplemental data',
				'examples': ['Geomagnetic Field Model[https://earthref.org/ERDA/1137/]', 'Geochemistry Data[https://earthref.org/ERDA/192/]:PADM2M Field Model[https://earthref.org/ERDA/1138/]']
			},
			'description': {
				'label': 'Description',
				'group': 'Contribution',
				'position': 12,
				'type': 'String',
				'description': 'Contribution description and update comments',
				'examples': ['Fixes errors in latitudes and adds measurement data'],
				'validations': ['recommended()']
			}
		}
	}

	,
	'cruises': {
		'label': 'Cruises',
		'position': 2,
		'description': 'Cruise or expedition',
		'notes': 'Drilling PI and platform metadata',
		'columns': {
			'contribution_id': {
				'label': 'Contribution ID',
				'group': 'Contribution',
				'position': 1,
				'type': 'Integer',
				'description': 'Unique CDR Contribution ID',
				'notes': 'Written during contribution activation',
				'examples': ['5412'],
				'validations': ['downloadOnly()']
			},
			'cruise': {
				'label': 'Cruise/Expedition Name',
				'group': 'Names',
				'position': 2,
				'type': 'String',
				'description': 'Name for cruise or expedition',
				'examples': ['San Francisco Volcanic Province', 'Dredge AMAT02-D12', 'Site 801'],
				'validations': ['key()', 'required()']
			},
			'research_vessel': {
				'label': 'Research Vessel Name',
				'group': 'Cruise',
				'position': 3,
				'type': 'String',
				'description': 'Research vessel name',
				'examples': ['SFVP01:SFVP02']
			},
			'cruise_alternatives': {
				'label': 'Cruise/Expedition Name Alternatives',
				'group': 'Cruise',
				'position': 4,
				'type': 'List',
				'description': 'Colon-delimited list of alternative names and abbreviations'
			},
			'description': {
				'label': 'Description',
				'group': 'Metadata',
				'position': 5,
				'type': 'String',
				'description': 'Location and result description and comments'
			},
			'external_database_ids': {
				'label': 'External Database IDs',
				'group': 'Metadata',
				'position': 6,
				'type': 'Dictionary',
				'description': 'Dictionary of external databases and IDs where data are used',
				'examples': ['GEOMAGIA50[1435]:CALS7K.2[23]', 'ARCHEO00[2329]', 'ARCHEO00[] if the ID is unknown'],
				'validations': ['cv("database_name")']
			},
			'pis': {
				'label': 'Principal Investigator Names',
				'group': 'Metadata',
				'position': 7,
				'type': 'List',
				'description': 'Colon-delimited list of EarthRef handles or ORCIDs or names and emails for principal investigators who organized the expedition',
				'examples': ['@user1:@user2:0000-0002-9000-2100:Not A. Member <no.earthref.handle@gmail.com>'],
				'validations': ['type("users")']
			},
			'scientists': {
				'label': 'Research Scientist Names',
				'group': 'Metadata',
				'position': 8,
				'type': 'List',
				'description': 'Colon-delimited list of EarthRef handles or ORCIDs or names and emails for scientists who described the location',
				'examples': ['@user1:@user2:0000-0002-9000-2100:Not A. Member <no.earthref.handle@gmail.com>'],
				'validations': ['type("users")']
			},
			'analysts': {
				'label': 'Analyst Names',
				'group': 'Metadata',
				'position': 9,
				'type': 'List',
				'description': 'Colon-delimited list of EarthRef handles or ORCIDs or names and emails for analysts',
				'examples': ['@user1:@user2:0000-0002-9000-2100:Not A. Member <no.earthref.handle@gmail.com>'],
				'validations': ['type("users")']
			}
		}
	}

	,
	'cores': {
		'label': 'Cores',
		'position': 3,
		'description': 'Drill site',
		'notes': 'Drilling spatiotemporal metadata and core physical properties',
		'columns': {
			'contribution_id': {
				'label': 'Contribution ID',
				'group': 'Contribution',
				'position': 1,
				'type': 'Integer',
				'description': 'Unique CDR Contribution ID',
				'notes': 'Written during contribution activation',
				'examples': ['5412'],
				'validations': ['downloadOnly()']
			},
			'core': {
				'label': 'Core Name',
				'group': 'Names',
				'position': 2,
				'type': 'String',
				'description': 'Name for core',
				'examples': ['SFVP01'],
				'validations': ['key()', 'required()']
			},
			'core_alternatives': {
				'label': 'Core Name Alternatives',
				'group': 'Names',
				'position': 3,
				'type': 'List',
				'description': 'Colon-delimited list of alternative names and abbreviations',
				'examples': ['San Francisco Volcanic Province', 'Dredge AMAT02-D12', 'Site 801']
			},
			'cruise': {
				'label': 'Cruise/Expedition Name',
				'group': 'Parent',
				'position': 4,
				'type': 'String',
				'description': 'Name for cruise or expedition',
				'examples': ['San Francisco Volcanic Province', 'Dredge AMAT02-D12', 'Site 801'],
				'validations': ['in("cruises.cruise")', 'required()']
			},
			'method': {
				'label': 'Coring Method',
				'group': 'Core',
				'position': 5,
				'type': 'String',
				'description': 'Coring method',
				'validations': ['cv("core_method")', 'required()']
			},
			'igsn': {
				'label': 'IGSN',
				'group': 'Core',
				'position': 5,
				'type': 'String',
				'description': 'International Geo Sample Number',
				'validations': ['type("igsn")']
			},
			'material': {
				'label': 'Core Material',
				'group': 'Core',
				'position': 6,
				'type': 'String',
				'description': 'Core primary material'
			},
			'diameter': {
				'label': 'Core Diameter',
				'group': 'Core',
				'position': 7,
				'type': 'Number',
				'unit': 'cm',
				'description': 'Core diameter',
				'validations': ['recommended()']
			},
			'length': {
				'label': 'Core Length',
				'group': 'Core',
				'position': 8,
				'type': 'Number',
				'unit': 'm',
				'description': 'Core length'
			},
			'mbsl_start': {
				'label': 'Start Depth Below Sea Level',
				'group': 'Core',
				'position': 9,
				'type': 'Number',
				'unit': 'm',
				'description': 'Core depth start below sea level, negative for terrestrial cores starting above sea level'
			},
			'mbsl_stop': {
				'label': 'Stop Depth Below Sea Level',
				'group': 'Core',
				'position': 10,
				'type': 'Number',
				'unit': 'm',
				'description': 'Core depth stop below sea level, negative for terrestrial cores ending above sea level'
			},
			'lat': {
				'label': 'Latitude',
				'group': 'Geography',
				'position': 11,
				'type': 'Number',
				'unit': 'Degrees',
				'description': 'Drill site geographic location, Latitude',
				'validations': ['min(-90)', 'max(90)', 'required()']
			},
			'lat_sigma': {
				'label': 'Latitude Sigma',
				'group': 'Geography',
				'position': 12,
				'type': 'Number',
				'unit': 'Degrees',
				'description': 'Drill site geographic location averaging uncertainty, Latitude',
				'notes': 'Standard error or standard deviation at one sigma',
				'validations': ['min(0)', 'max(180)']
			},
			'lon': {
				'label': 'Longitude',
				'group': 'Geography',
				'position': 13,
				'type': 'Number',
				'unit': 'Degrees',
				'description': 'Drill site geographic location, Longitude',
				'validations': ['min(0)', 'max(360)', 'required()']
			},
			'lon_sigma': {
				'label': 'Longitude Sigma',
				'group': 'Geography',
				'position': 14,
				'type': 'Number',
				'unit': 'Degrees',
				'description': 'Drill site geographic location averaging uncertainty, Longitude',
				'notes': 'Standard error or standard deviation at one sigma',
				'validations': ['min(0)', 'max(360)']
			},
			'geographic_precision': {
				'label': 'Geographic Precision',
				'group': 'Geography',
				'position': 15,
				'type': 'Number',
				'unit': 'Degrees',
				'description': 'Drill site geographic location, Precision in latitude and longitude',
				'notes': 'Decimal degrees',
				'validations': ['min(0)', 'max(360)']
			},
			'continent_ocean': {
				'label': 'Continent or Ocean Name',
				'group': 'Geography',
				'position': 16,
				'type': 'String',
				'description': 'Drill site continent or ocean name',
				'validations': ['cv("continent_ocean")']
			},
			'country': {
				'label': 'Country Name',
				'group': 'Geography',
				'position': 17,
				'type': 'String',
				'description': 'Country name',
				'validations': ['cv("country")']
			},
			'state_province': {
				'label': 'State or Province Name',
				'group': 'Geography',
				'position': 18,
				'type': 'String',
				'description': 'State or Province Name',
				'examples': ['California', 'Alberta', 'Chongqing', 'Minas Gerais'],
				'validations': ['cv("state_province")']
			},
			'ocean_sea': {
				'label': 'Ocean or Sea Name',
				'group': 'Geography',
				'position': 19,
				'type': 'String',
				'description': 'Ocean or sea name',
				'validations': ['cv("ocean_sea")']
			},
			'region': {
				'label': 'Region Name',
				'group': 'Geography',
				'position': 20,
				'type': 'String',
				'description': 'Region name',
				'validations': ['sv("region")']
			},
			'village_city': {
				'label': 'Village or City Name',
				'group': 'Geography',
				'position': 21,
				'type': 'String',
				'description': 'Village or city name',
				'validations': ['sv("village_city")']
			},
			'start_timestamp': {
				'label': 'Drilling Start Date/Time',
				'group': 'Date Time',
				'position': 22,
				'type': 'String',
				'description': 'Date and/or time in ISO8601 standard format',
				'validations': ['type("date_time")']
			},
			'end_timestamp': {
				'label': 'Drilling Stop Date/Time',
				'group': 'Date Time',
				'position': 23,
				'type': 'String',
				'description': 'Date and/or time in ISO8601 standard format',
				'validations': ['type("date_time")']
			},
			'description': {
				'label': 'Description',
				'group': 'Metadata',
				'position': 24,
				'type': 'String',
				'description': 'Core description and comments'
			},
			'external_database_ids': {
				'label': 'External Database IDs',
				'group': 'Metadata',
				'position': 25,
				'type': 'Dictionary',
				'description': 'Dictionary of external databases and IDs where data are used',
				'examples': ['GEOMAGIA50[1435]:CALS7K.2[23]', 'ARCHEO00[2329]', 'ARCHEO00[] if the ID is unknown'],
				'validations': ['cv("database_name")']
			}
		}
	}

	,
	'sections': {
		'label': 'Sections',
		'position': 4,
		'description': 'Full round section of a core',
		'notes': 'Section length and identifiers',
		'columns': {
			'contribution_id': {
				'label': 'Contribution ID',
				'group': 'Contribution',
				'position': 1,
				'type': 'Integer',
				'description': 'Unique CDR Contribution ID',
				'notes': 'Written during contribution activation',
				'examples': ['5412'],
				'validations': ['downloadOnly()']
			},
			'section': {
				'label': 'Section Name',
				'group': 'Names',
				'position': 2,
				'type': 'String',
				'description': 'Name for section',
				'notes': 'This may be the same as the Section Number.',
				'examples': ['SFVP01-03'],
				'validations': ['key()', 'required()']
			},
			'section_alternatives': {
				'label': 'Section Name Alternatives',
				'group': 'Names',
				'position': 4,
				'type': 'List',
				'description': 'Colon-delimited list of alternative names and abbreviations',
				'examples': ['San Francisco Volcanic Province', 'Dredge AMAT02-D12', 'Site 801']
			},
			'core': {
				'label': 'Core Name',
				'group': 'Parent',
				'position': 3,
				'type': 'String',
				'description': 'Name for core',
				'examples': ['SFVP01'],
				'validations': ['in("cores.core")', 'required()']
			},
			'number': {
				'label': 'Section Number',
				'group': 'Section',
				'position': 5,
				'type': 'Number',
				'description': 'Nth section in the core starting at the top with 1',
				'examples': ['2017', '2014-04-21', '1970-01-01T00:00:00', '1969-07-20T22:56:15-04:00'],
				'validations': ['type("date_time")']
			},
			'igsn': {
				'label': 'IGSN',
				'group': 'Section',
				'position': 4,
				'type': 'String',
				'description': 'International Geo Sample Number',
				'validations': ['type("igsn")']
			},
			'core_depth_top': {
				'label': 'Core Depth Top',
				'group': 'Section',
				'position': 6,
				'type': 'Number',
				'unit': 'cm',
				'description': 'Depth in the core of the top of the section',
				'examples': ['2017', '2014-04-21', '1970-01-01T00:00:00', '1969-07-20T22:56:15-04:00'],
				'validations': ['type("date_time")']
			},
			'core_depth_bottom': {
				'label': 'Core Depth Bottom',
				'group': 'Section',
				'position': 5,
				'type': 'Number',
				'unit': 'cm',
				'description': 'Depth in the core of the bottom of the section',
				'examples': ['SIO0A0987', 'SIO001317']
			},
			'description': {
				'label': 'Description',
				'group': 'Metadata',
				'position': 6,
				'type': 'String',
				'description': 'Section description and comments'
			},
			'external_database_ids': {
				'label': 'External Database IDs',
				'group': 'Metadata',
				'position': 7,
				'type': 'Dictionary',
				'description': 'Dictionary of external databases and IDs where data are used',
				'examples': ['GEOMAGIA50[1435]:CALS7K.2[23]', 'ARCHEO00[2329]', 'ARCHEO00[] if the ID is unknown'],
				'validations': ['cv("database_name")']
			}
		}
	}

	,
	'halves': {
		'label': 'Halves',
		'position': 5,
		'description': 'Archive or working half of a core section',
		'notes': 'Section-half type and identifiers',
		'columns': {
			'contribution_id': {
				'label': 'Contribution ID',
				'group': 'Contribution',
				'position': 1,
				'type': 'Integer',
				'description': 'Unique CDR Contribution ID',
				'notes': 'Written during contribution activation',
				'examples': ['5412'],
				'validations': ['downloadOnly()']
			},
			'half': {
				'label': 'Section Half Name',
				'group': 'Names',
				'position': 2,
				'type': 'String',
				'description': 'Name for section half',
				'examples': ['SFVP01-01a'],
				'validations': ['key()', 'required()']
			},
			'section_half_alternatives': {
				'label': 'Section Half Names',
				'group': 'Names',
				'position': 4,
				'type': 'List',
				'description': 'Colon-delimited list of the names of experiments included in the result',
				'examples': ['SFVP01-01a-LT-AF-Z:SFVP01-01a-LT-T-Z']
			},
			'section': {
				'label': 'Section Name',
				'group': 'Parent',
				'position': 3,
				'type': 'String',
				'description': 'Name for section',
				'examples': ['SFVP01-01'],
				'validations': ['in("sections.section")', 'required()']
			},
			'type': {
				'label': 'Working or Archive',
				'group': 'Half',
				'position': 5,
				'type': 'String',
				'description': 'Work or archive section half',
				'validations': ['cv("section_half_type")', 'required()']
			},
			'igsn': {
				'label': 'IGSN',
				'group': 'Half',
				'position': 4,
				'type': 'String',
				'description': 'International Geo Sample Number',
				'validations': ['type("igsn")']
			},
			'description': {
				'label': 'Description',
				'group': 'Metadata',
				'position': 6,
				'type': 'String',
				'description': 'Section half description and comments'
			},
			'external_database_ids': {
				'label': 'External Database IDs',
				'group': 'Metadata',
				'position': 7,
				'type': 'Dictionary',
				'description': 'Dictionary of external databases and IDs where data are used',
				'examples': ['GEOMAGIA50[1435]:CALS7K.2[23]', 'ARCHEO00[2329]', 'ARCHEO00[] if the ID is unknown'],
				'validations': ['cv("database_name")']
			}
		}
	}

	,
	'measurements': {
		'label': 'Measurements',
		'position': 6,
		'description': 'Measurements',
		'notes': 'Raw instrument data and calibrated results',
		'columns': {
			'contribution_id': {
				'label': 'Contribution ID',
				'group': 'Contribution',
				'position': 1,
				'type': 'Integer',
				'description': 'Unique CDR Contribution ID',
				'notes': 'Written during contribution activation',
				'examples': ['5412'],
				'validations': ['downloadOnly()']
			},
			'measurement': {
				'label': 'Measurement Name',
				'group': 'Names',
				'position': 2,
				'type': 'String',
				'description': 'Unique measurement identifier',
				'examples': ['SFVP01-01a-LT-AF-Z-1', 'SFVP01-01a-LT-AF-Z-2', 'SFVP01-01a-LT-T-Z-1'],
				'validations': ['key()', 'required()', 'unique()']
			},
			'experiment': {
				'label': 'Experiment Name',
				'group': 'Names',
				'position': 3,
				'type': 'String',
				'description': 'Name for experiment',
				'examples': ['SFVP01-01a-LT-AF-Z'],
				'validations': ['required()']
			},
			'section': {
				'label': 'Section Name',
				'group': 'Parent',
				'position': 4,
				'type': 'String',
				'validations': ['in("sections.section")', 'requiredOneInGroup("Parent")']
			},
			'half': {
				'label': 'Section Half Name',
				'group': 'Parent',
				'position': 5,
				'type': 'String',
				'description': 'Name for specimen',
				'examples': ['SFVP01-01a'],
				'validations': ['in("halves.half")', 'requiredOneInGroup("Parent")']
			},
			'sequence': {
				'label': 'Measurement Sequence',
				'group': 'Description',
				'position': 6,
				'type': 'Integer',
				'description': 'Order of the measurements',
				'examples': ['-50', '0', '1', '343'],
				'validations': ['unique()', 'recommended()']
			},
			'depth': {
				'label': 'Measurement Depth',
				'group': 'Description',
				'position': 7,
				'type': 'Number',
				'unit': 'm',
				'description': 'Position of the measurement relative to the top of the core'
			},
			'sub_bottom': {
				'label': '',
				'group': 'Description',
				'position': 8,
				'type': ''
			},
			'thickness': {
				'label': '',
				'group': 'Description',
				'position': 9,
				'type': ''
			},
			'standard': {
				'label': 'Measurement Standard',
				'group': 'Description',
				'position': 10,
				'type': 'String',
				'unit': 'Flag',
				'description': 'Indicating if a standard (s) or an unknown (u) measurement',
				'validations': ['cv("measurement_type")']
			},
			'quality': {
				'label': 'Measurement Quality',
				'group': 'Description',
				'position': 11,
				'type': 'String',
				'unit': 'Flag',
				'description': 'Indicating if a good (g) or bad (b) measurement',
				'notes': 'Can be left empty. This is the case for many legacy data sets.',
				'validations': ['cv("data_quality")', 'required()']
			},
			'method_codes': {
				'label': 'Method Codes',
				'group': 'Description',
				'position': 12,
				'type': 'List',
				'description': 'Colon-delimited list of method codes',
				'validations': ['type("method_codes")', 'required()']
			},
			'instrument_codes': {
				'label': 'Instrument Code',
				'group': 'Description',
				'position': 13,
				'type': 'List',
				'description': 'Colon-delimited list of instrument codes',
				'examples': ['SIO-Bubba', 'IRM-OldBlue']
			},
			'result_type': {
				'label': 'Result Type',
				'group': 'Description',
				'position': 14,
				'type': 'String',
				'unit': 'Flag',
				'description': 'Individual/raw data (i) or model (m) data',
				'notes': 'Usually this parameter will be set to (i). (m) is used when low level data is calculated using a model. For example the magnetic moment at a location using a SQUID microscope could be modeled (m) from  the raw Bz (i) field measured.',
				'examples': ['i', 'm'],
				'validations': ['cv("data_type")']
			},
			'citations': {
				'label': 'Citation DOIs',
				'group': 'Description',
				'position': 15,
				'type': 'List',
				'description': 'Colon-delimited list of citation DOIs',
				'examples': ['10.1029/92JB01202', '10.1029/2003GC000635:This study', '"10.1023/A:1015035228810":This study'],
				'validations': ['type("references")', 'required()']
			},
			'pwave_a': {
				'label': 'P-Wave Amplitude',
				'group': 'Multi-Sensor Track (MST)',
				'position': 16,
				'type': 'Number'
			},
			'pwave_v': {
				'label': 'P-Wave Velocity',
				'group': 'Multi-Sensor Track (MST)',
				'position': 17,
				'type': 'Number',
				'unit': 'm/s'
			},
			'density': {
				'label': 'Gamma Density',
				'group': 'Multi-Sensor Track (MST)',
				'position': 18,
				'type': 'Number',
				'unit': 'kg/m^3'
			},
			'susc': {
				'label': 'Raw Magnetic Susceptibility',
				'group': 'Multi-Sensor Track (MST)',
				'position': 19,
				'type': 'Number',
				'unit': 'SI Dimensionless',
				'description': 'Magnetic susceptibility, uncorrected'
			},
			'susc_chi_volume': {
				'label': 'Magnetic Susceptibility X Volume',
				'group': 'Multi-Sensor Track (MST)',
				'position': 20,
				'type': 'Number',
				'unit': 'SI Dimensionless',
				'description': 'Average magnetic susceptibility, Volume normalized'
			},
			'susc_chi_mass': {
				'label': 'Magnetic Susceptibility X Mass',
				'group': 'Multi-Sensor Track (MST)',
				'position': 21,
				'type': 'Number',
				'unit': 'm^3/kg',
				'description': 'Average magnetic susceptibility, Mass normalized'
			},
			'res': {
				'label': 'Electrical Resistivity',
				'group': 'Multi-Sensor Track (MST)',
				'position': 22,
				'type': 'Number',
				'unit': 'ohm-m',
				'description': 'Specific electrical resistance, uncorrected'
			},
			'res_temp': {
				'label': 'Electrical Resistivity',
				'group': 'Multi-Sensor Track (MST)',
				'position': 23,
				'type': 'Number',
				'unit': 'ohm-m',
				'description': 'Specific electrical resistance, temperature corrected'
			},
			'xrf_dist_laser': {
				'label': 'Laser Distance',
				'group': 'X-Ray Flourescence (XRF)',
				'position': 24,
				'type': 'Number',
				'unit': 'm',
				'description': 'Distance between the laser and the sample surface'
			},
			'xrf_mse': {
				'label': 'Mean Squared Error',
				'group': 'X-Ray Flourescence (XRF)',
				'position': 25,
				'type': 'Number',
				'unit': 'cps',
				'description': 'Count rate mean squared error'
			},
			'xrf_count_rate': {
				'label': 'Detector Total Count Rate',
				'group': 'X-Ray Flourescence (XRF)',
				'position': 26,
				'type': 'Number',
				'unit': 'cps',
				'description': 'Total counts per second'
			},
			'al': {
				'label': 'Aluminium',
				'group': 'X-Ray Flourescence (XRF)',
				'position': 27,
				'type': 'Number',
				'unit': 'cps',
				'description': 'Count rate for Aluminium'
			},
			'si': {
				'label': 'Silicon',
				'group': 'X-Ray Flourescence (XRF)',
				'position': 28,
				'type': 'Number',
				'unit': 'cps',
				'description': 'Count rate for Silicon'
			},
			'p': {
				'label': 'Phosphorus',
				'group': 'X-Ray Flourescence (XRF)',
				'position': 29,
				'type': 'Number',
				'unit': 'cps',
				'description': 'Count rate for Phosphorus'
			},
			's': {
				'label': 'Sulfur',
				'group': 'X-Ray Flourescence (XRF)',
				'position': 30,
				'type': 'Number',
				'unit': 'cps',
				'description': 'Count rate for Sulfur'
			},
			'cl': {
				'label': 'Chlorine',
				'group': 'X-Ray Flourescence (XRF)',
				'position': 31,
				'type': 'Number',
				'unit': 'cps',
				'description': 'Count rate for Chlorine'
			},
			'ar': {
				'label': 'Argon',
				'group': 'X-Ray Flourescence (XRF)',
				'position': 32,
				'type': 'Number',
				'unit': 'cps',
				'description': 'Count rate for Argon'
			},
			'k': {
				'label': 'Potassium',
				'group': 'X-Ray Flourescence (XRF)',
				'position': 33,
				'type': 'Number',
				'unit': 'cps',
				'description': 'Count rate for Potassium'
			},
			'ca': {
				'label': 'Calcium',
				'group': 'X-Ray Flourescence (XRF)',
				'position': 34,
				'type': 'Number',
				'unit': 'cps',
				'description': 'Count rate for Calcium'
			},
			'ti': {
				'label': 'Titanium',
				'group': 'X-Ray Flourescence (XRF)',
				'position': 35,
				'type': 'Number',
				'unit': 'cps',
				'description': 'Count rate for Titanium'
			},
			'mn': {
				'label': 'Manganese',
				'group': 'X-Ray Flourescence (XRF)',
				'position': 36,
				'type': 'Number',
				'unit': 'cps',
				'description': 'Count rate for Manganese'
			},
			'fe': {
				'label': 'Iron',
				'group': 'X-Ray Flourescence (XRF)',
				'position': 37,
				'type': 'Number',
				'unit': 'cps',
				'description': 'Count rate for Iron'
			},
			'ni': {
				'label': 'Nickel',
				'group': 'X-Ray Flourescence (XRF)',
				'position': 38,
				'type': 'Number',
				'unit': 'cps',
				'description': 'Count rate for Nickel'
			},
			'cu': {
				'label': 'Copper',
				'group': 'X-Ray Flourescence (XRF)',
				'position': 39,
				'type': 'Number',
				'unit': 'cps',
				'description': 'Count rate for Copper'
			},
			'zn': {
				'label': 'Zinc',
				'group': 'X-Ray Flourescence (XRF)',
				'position': 40,
				'type': 'Number',
				'unit': 'cps',
				'description': 'Count rate for Zinc'
			},
			'br': {
				'label': 'Bromine',
				'group': 'X-Ray Flourescence (XRF)',
				'position': 41,
				'type': 'Number',
				'unit': 'cps',
				'description': 'Count rate for Bromine'
			},
			'rb': {
				'label': 'Rubidium',
				'group': 'X-Ray Flourescence (XRF)',
				'position': 42,
				'type': 'Number',
				'unit': 'cps',
				'description': 'Count rate for Rubidium'
			},
			'sr': {
				'label': 'Strontium',
				'group': 'X-Ray Flourescence (XRF)',
				'position': 43,
				'type': 'Number',
				'unit': 'cps',
				'description': 'Count rate for Strontium'
			},
			'y': {
				'label': 'Yttrium',
				'group': 'X-Ray Flourescence (XRF)',
				'position': 44,
				'type': 'Number',
				'unit': 'cps',
				'description': 'Count rate for Yttrium'
			},
			'zr': {
				'label': 'Zirconium',
				'group': 'X-Ray Flourescence (XRF)',
				'position': 45,
				'type': 'Number',
				'unit': 'cps',
				'description': 'Count rate for Zirconium'
			},
			'i': {
				'label': 'Iodine',
				'group': 'X-Ray Flourescence (XRF)',
				'position': 46,
				'type': 'Number',
				'unit': 'cps',
				'description': 'Count rate for Iodine'
			},
			'hg': {
				'label': 'Mercury',
				'group': 'X-Ray Flourescence (XRF)',
				'position': 47,
				'type': 'Number',
				'unit': 'cps',
				'description': 'Count rate for Mercury'
			},
			'pb': {
				'label': 'Lead',
				'group': 'X-Ray Flourescence (XRF)',
				'position': 48,
				'type': 'Number',
				'unit': 'cps',
				'description': 'Count rate for Lead'
			},
			'description': {
				'label': 'Description',
				'group': 'Metadata',
				'position': 49,
				'type': 'String',
				'description': 'Measurement description and comments'
			},
			'timestamp': {
				'label': 'Measurement Timestamp',
				'group': 'Metadata',
				'position': 50,
				'type': 'Timestamp',
				'description': 'Date and time when the measurement occured',
				'notes': 'ISO 8601 date and time (e.g. "yyyy-mm-ddThh:mm:ss.sssZ")',
				'examples': ['2017', '2014-04-21', '1970-01-01T00:00:00', '1969-07-20T22:56:15-04:00']
			},
			'software_packages': {
				'label': 'CDR Software Packages',
				'group': 'Metadata',
				'position': 51,
				'type': 'List',
				'description': 'Colon-delimited list of software used for data reduction',
				'examples': ['PmagPy v1.67b', 'FORCinel v1.11']
			},
			'external_database_ids': {
				'label': 'External Database IDs',
				'group': 'Metadata',
				'position': 52,
				'type': 'Dictionary',
				'description': 'Dictionary of external databases and IDs where data are used',
				'examples': ['GEOMAGIA50[1435]:CALS7K.2[23]', 'ARCHEO00[2329]', 'ARCHEO00[] if the ID is unknown'],
				'validations': ['cv("database_name")']
			},
			'analysts': {
				'label': 'Analyst Names',
				'group': 'Metadata',
				'position': 53,
				'type': 'List',
				'description': 'Colon-delimited list of EarthRef handles or ORCIDs or names and emails for analysts or ORCID id',
				'examples': ['@user1:@user2:0000-0002-9000-2100:Not A. Member <no.earthref.handle@gmail.com>'],
				'validations': ['type("users")']
			}
		}
	}

	,
	'supplements': {
		'label': 'Supplements',
		'position': 7,
		'description': 'Images, documents, and plots',
		'notes': 'Reports, Line-scan images, CT scan DICOM files, raster or vector plots',
		'columns': {
			'contribution_id': {
				'label': 'Contribution ID',
				'group': 'Contribution',
				'position': 1,
				'type': 'Integer',
				'description': 'Unique CDR Contribution ID',
				'notes': 'Written during contribution activation',
				'examples': ['5412'],
				'validations': ['downloadOnly()']
			},
			'location': {
				'label': 'Location Name',
				'group': 'Parent',
				'position': 2,
				'type': 'String',
				'description': 'Name for location, dredge or drill site',
				'examples': ['San Francisco Volcanic Province', 'Dredge AMAT02-D12', 'Site 801'],
				'validations': ['in("locations.location")', 'requiredOneInGroup("Names")']
			},
			'site': {
				'label': 'Site Name',
				'group': 'Parent',
				'position': 3,
				'type': 'String',
				'description': 'Name for site',
				'examples': ['Bas123a'],
				'validations': ['in("sites.site")', 'requiredOneInGroup("Names")']
			},
			'sample': {
				'label': 'Sample Name',
				'group': 'Parent',
				'position': 4,
				'type': 'String',
				'description': 'Name for sample',
				'examples': ['Bas123a-01'],
				'validations': ['in("samples.sample")', 'requiredOneInGroup("Names")']
			},
			'specimen': {
				'label': 'Specimen Name',
				'group': 'Parent',
				'position': 5,
				'type': 'String',
				'description': 'Name for specimen',
				'examples': ['Bas123a-01a'],
				'validations': ['in("specimens.specimen")', 'requiredOneInGroup("Names")']
			},
			'file': {
				'label': 'File Name',
				'group': 'Image',
				'position': 6,
				'type': 'String',
				'description': 'Name of image',
				'examples': ['IMG_1429.jpg'],
				'validations': ['key()', 'required()']
			},
			'type': {
				'label': 'Type',
				'group': 'Image',
				'position': 7,
				'type': 'String',
				'description': 'Type of image',
				'validations': ['cv("image_type")', 'required()']
			},
			'title': {
				'label': 'Title',
				'group': 'Image',
				'position': 8,
				'type': 'String',
				'description': 'Short Image title',
				'examples': ['High tech solutions for being lonely at sea'],
				'validations': ['required()']
			},
			'keywords': {
				'label': 'Keywords',
				'group': 'Image',
				'position': 9,
				'type': 'List',
				'description': 'Colon delimited list of keywords associated with image',
				'examples': ['Simrad Computer', 'Multibeam', 'Seamounts'],
				'validations': ['required()']
			},
			'description': {
				'label': 'Description',
				'group': 'Metadata',
				'position': 10,
				'type': 'String',
				'description': 'Image description and comments'
			},
			'timestamp': {
				'label': 'Creation Timestamp',
				'group': 'Metadata',
				'position': 11,
				'type': 'Timestamp',
				'description': 'UTC Date and time of when image was taken or created',
				'notes': 'ISO 8601 date and time (e.g. "yyyy-mm-ddThh:mm:ss.sssZ")',
				'validations': ['type("date_time")']
			},
			'software_packages': {
				'label': 'Software Packages',
				'group': 'Metadata',
				'position': 12,
				'type': 'List',
				'description': 'Colon-delimited list of software used for generating the plot',
				'examples': ['PmagPy v1.67b', 'FORCinel v1.11']
			},
			'analysts': {
				'label': 'Analyst Names',
				'group': 'Metadata',
				'position': 13,
				'type': 'List',
				'description': 'Colon-delimited list of EarthRef handles or ORCIDs or names and emails for analysts',
				'examples': ['@user1:@user2:0000-0002-9000-2100:Not A. Member <no.earthref.handle@gmail.com>'],
				'validations': ['type("users")']
			},
			'photographers': {
				'label': 'Photographer Names',
				'group': 'Metadata',
				'position': 14,
				'type': 'List',
				'description': 'Colon-delimited list of EarthRef handles or ORCIDs or names and emails for photographers',
				'examples': ['@user1:@user2:0000-0002-9000-2100:Not A. Member <no.earthref.handle@gmail.com>'],
				'validations': ['type("users")']
			},
			'citations': {
				'label': 'Citation DOIs',
				'group': 'Metadata',
				'position': 15,
				'type': 'List',
				'description': 'Colon-delimited list of citation DOIs',
				'examples': ['10.1029/92JB01202', '10.1029/2003GC000635:This study', '"10.1023/A:1015035228810":This study'],
				'validations': ['type("references")']
			}
		}
	}
}
};